import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || this.config.get('SMTP_HOST');
    const port = parseInt(process.env.SMTP_PORT || this.config.get('SMTP_PORT') || '587', 10);
    const user = process.env.SMTP_USER || this.config.get('SMTP_USER');
    const pass = process.env.SMTP_PASS || this.config.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — email notifications disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    this.logger.log(`Email transport configured: ${host}:${port}`);
  }

  async send(payload: EmailPayload): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email skipped (SMTP not configured): ${payload.subject}`);
      return false;
    }
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@josmef.com';
      await this.transporter.sendMail({
        from: `"JOSMEF HRMS" <${from}>`,
        to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      this.logger.log(`Email sent: "${payload.subject}" → ${payload.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Email failed: ${err.message}`);
      return false;
    }
  }

  // ─── Template helpers ───────────────────────────────────────────────

  async sendNteIssued(opts: {
    employeeEmail: string;
    employeeName: string;
    nteNumber: string;
    subject: string;
    deadline: string;
    issuedBy: string;
  }) {
    return this.send({
      to: opts.employeeEmail,
      subject: `[NTE] ${opts.nteNumber} — ${opts.subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#1e3a5f">Notice to Explain</h2>
          <p>Dear <strong>${opts.employeeName}</strong>,</p>
          <p>A Notice to Explain (<strong>${opts.nteNumber}</strong>) has been issued to you regarding:</p>
          <blockquote style="border-left:4px solid #e53e3e;padding:8px 16px;color:#333;margin:16px 0">
            ${opts.subject}
          </blockquote>
          <p>Please submit your written explanation by <strong>${opts.deadline}</strong>.</p>
          <p>If you have questions, contact your HR Officer.</p>
          <p>Issued by: <strong>${opts.issuedBy}</strong></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#888">JOSMEF HRMS — Automated Notification</p>
        </div>`,
    });
  }

  async sendExitClearanceCreated(opts: {
    employeeEmail: string;
    employeeName: string;
    lastWorkingDay: string;
    separationType: string;
  }) {
    return this.send({
      to: opts.employeeEmail,
      subject: `Exit Clearance Process Started — ${opts.employeeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#1e3a5f">Exit Clearance Process</h2>
          <p>Dear <strong>${opts.employeeName}</strong>,</p>
          <p>Your exit clearance process has been initiated in the HRMS system.</p>
          <ul>
            <li><strong>Separation Type:</strong> ${opts.separationType.replace(/_/g, ' ')}</li>
            <li><strong>Last Working Day:</strong> ${opts.lastWorkingDay}</li>
          </ul>
          <p>Please coordinate with all departments listed in your clearance checklist.
             A representative will clear you on each item.</p>
          <p>Log in to the HRMS portal to track your clearance progress.</p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#888">JOSMEF HRMS — Automated Notification</p>
        </div>`,
    });
  }

  async sendContractExpiryWarning(opts: {
    employeeEmail: string;
    employeeName: string;
    contractEndDate: string;
    daysLeft: number;
    hrEmail: string;
  }) {
    return this.send({
      to: [opts.employeeEmail, opts.hrEmail],
      subject: `⚠️ Contract Expiring in ${opts.daysLeft} Day${opts.daysLeft !== 1 ? 's' : ''} — ${opts.employeeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#d97706">Contract Expiry Notice</h2>
          <p>This is an automated reminder that the employment contract for
             <strong>${opts.employeeName}</strong> is expiring soon.</p>
          <ul>
            <li><strong>Contract End Date:</strong> ${opts.contractEndDate}</li>
            <li><strong>Days Remaining:</strong> ${opts.daysLeft}</li>
          </ul>
          <p>Please take appropriate action (renewal, regularization, or end of contract processing).</p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#888">JOSMEF HRMS — Automated Notification</p>
        </div>`,
    });
  }
}
