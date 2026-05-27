import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Payroll } from '../payroll/entities/payroll.entity';
import {
  ResumeParseDto, HrChatDto, EmployeeInsightDto,
  JobDescriptionDto, PerformanceReviewDto,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  private client: Anthropic | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
    @InjectRepository(Payroll) private payRepo: Repository<Payroll>,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  private ensureClient() {
    if (!this.client) {
      throw new BadRequestException(
        'AI features require ANTHROPIC_API_KEY in environment variables',
      );
    }
  }

  private async ask(systemPrompt: string, userMessage: string): Promise<string> {
    this.ensureClient();
    const response = await this.client!.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  // 1. Resume Parser — extract structured data from resume text
  async parseResume(dto: ResumeParseDto) {
    const system = `You are an HR resume parser. Extract structured data from the resume text and return ONLY valid JSON with these fields:
{
  "firstName": "", "middleName": "", "lastName": "",
  "email": "", "mobile": "", "dateOfBirth": "",
  "gender": "", "address": "", "city": "", "province": "",
  "positionApplied": "", "expectedSalary": null,
  "education": [{"school": "", "degree": "", "year": ""}],
  "experience": [{"company": "", "position": "", "duration": "", "description": ""}],
  "skills": [],
  "summary": ""
}
If a field is not found, use empty string or null. Return ONLY the JSON object, no markdown.`;

    const result = await this.ask(system, dto.resumeText);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return { raw: result, error: 'Could not parse structured data' };
    }
  }

  // 2. HR Chat Assistant — answer HR policy and employee questions
  async hrChat(dto: HrChatDto) {
    // Gather context about the company
    const empCount = await this.empRepo.count({ where: { deletedAt: null as any } });

    const system = `You are JOSMEF HR Assistant, an AI-powered HR helpdesk for JOSMEF, a manpower/distribution company with approximately ${empCount} employees in the Philippines.

You help with:
- HR policies and procedures
- Philippine labor law questions (DOLE, Labor Code)
- Employee benefits (SSS, PhilHealth, Pag-IBIG, 13th month)
- Leave policies, overtime rules, night differential
- Recruitment best practices
- Performance management guidance
- Workplace conflict resolution

Be concise, professional, and accurate. If unsure, recommend consulting a labor lawyer or DOLE.
${dto.context ? `\nAdditional context: ${dto.context}` : ''}`;

    const reply = await this.ask(system, dto.message);
    return { reply };
  }

  // 3. Employee Insight — analyze attendance + payroll data for one employee
  async getEmployeeInsight(dto: EmployeeInsightDto) {
    const employee = await this.empRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) throw new BadRequestException('Employee not found');

    // Get last 30 days attendance
    const attendance = await this.attRepo.createQueryBuilder('a')
      .where("a.employeeId = :eid AND a.deleted_at IS NULL AND a.date >= CURRENT_DATE - INTERVAL '90 days'", { eid: dto.employeeId })
      .getMany();

    // Get last 3 payroll records
    const payroll = await this.payRepo.createQueryBuilder('p')
      .where('p.employeeId = :eid AND p.deleted_at IS NULL', { eid: dto.employeeId })
      .orderBy('p.created_at', 'DESC')
      .limit(3)
      .getMany();

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => ['present', 'late'].includes(a.status)).length;
    const lateDays = attendance.filter((a) => a.status === 'late').length;
    const absentDays = attendance.filter((a) => a.status === 'absent').length;
    const totalOT = attendance.reduce((s, a) => s + Number(a.overtimeHours || 0), 0);
    const totalLate = attendance.reduce((s, a) => s + Number(a.lateMinutes || 0), 0);

    const dataContext = `
Employee: ${employee.firstName} ${employee.lastName}
Position: ${employee.position}, Department: ${employee.department}
Status: ${employee.employmentStatus}, Date Hired: ${employee.dateHired}
Salary: ₱${employee.basicSalary}

Last 90 days attendance:
- Total records: ${totalDays}
- Present: ${presentDays}, Late: ${lateDays}, Absent: ${absentDays}
- Total OT hours: ${totalOT.toFixed(1)}
- Total late minutes: ${totalLate.toFixed(0)}
- Attendance rate: ${totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 'N/A'}%

Recent payroll (last ${payroll.length} periods):
${payroll.map((p) => `- Period: ${p.payPeriod}, Gross: ₱${Number(p.grossPay).toLocaleString()}, Net: ₱${Number(p.netPay).toLocaleString()}, Days worked: ${p.daysWorked}`).join('\n')}`;

    const system = `You are an HR analytics AI. Analyze the employee data and provide:
1. A brief performance summary (2-3 sentences)
2. Attendance pattern analysis
3. Key observations or concerns
4. Recommendations for HR/management
Be concise and data-driven. Use bullet points.`;

    const insight = await this.ask(system, dataContext);
    return {
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
      },
      metrics: {
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : null,
        lateDays,
        absentDays,
        totalOTHours: Math.round(totalOT * 10) / 10,
        totalLateMinutes: Math.round(totalLate),
      },
      insight,
    };
  }

  // 4. Job Description Generator
  async generateJobDescription(dto: JobDescriptionDto) {
    const system = `You are an HR job description writer for JOSMEF, a manpower/distribution company in the Philippines. Write professional, complete job descriptions. Include: Job Title, Department, Summary, Key Responsibilities (5-8), Qualifications (Required + Preferred), Skills, and Benefits. Format with clear headings.`;

    const prompt = `Generate a job description for:
Position: ${dto.position}
${dto.department ? `Department: ${dto.department}` : ''}
${dto.requirements ? `Additional requirements: ${dto.requirements}` : ''}`;

    const result = await this.ask(system, prompt);
    return { jobDescription: result };
  }

  // 5. Performance Review Draft Generator
  async generatePerformanceReview(dto: PerformanceReviewDto) {
    const system = `You are an HR performance review writer. Generate a professional, balanced performance review document. Include: Overall Rating Summary, Key Accomplishments, Areas of Strength, Areas for Improvement, Goals for Next Period, and Manager Recommendations. Be constructive and specific.`;

    const prompt = `Generate a performance review for:
Employee: ${dto.employeeName}
Position: ${dto.position}
${dto.period ? `Review Period: ${dto.period}` : ''}
${dto.strengths ? `Noted Strengths: ${dto.strengths}` : ''}
${dto.improvements ? `Areas to Improve: ${dto.improvements}` : ''}
${dto.goals ? `Goals: ${dto.goals}` : ''}`;

    const result = await this.ask(system, prompt);
    return { review: result };
  }
}
