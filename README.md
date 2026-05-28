# JOSMEF HRMS/CRM

Enterprise-grade Human Resource Management System for manpower/distribution companies.

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS + TypeScript
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Auth:** JWT + Role-based Access Control
- **AI:** Anthropic Claude (optional)

## Modules

- ✅ Authentication & RBAC (8 roles)
- ✅ Applicant Management (full recruitment pipeline)
- ✅ Trainee Management (training tracking + deployment)
- ✅ Employee Management (40+ fields, 6-tab form)
- ✅ Digital 201 File (10 document categories)
- ✅ Attendance System (geo-location + RFID support)
- ✅ Payroll (auto-generate from attendance, PH statutory deductions)
- ✅ Exit Clearance (multi-department checklist workflow)
- ✅ Analytics Dashboard (KPIs, charts, events)
- ✅ AI Hub (HR Chat, Resume Parser, JD Generator, Performance Review)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=josmef_hrms
JWT_SECRET=your-secret-key
JWT_EXPIRATION=8h
APP_PORT=4000
APP_ENV=development
ANTHROPIC_API_KEY=your-key-here  # Optional, for AI features
```

```bash
# Create database
createdb josmef_hrms

# Seed super admin
npm run seed

# Start development server
npm run start:dev
```

**Super Admin Login:** admin@josmef.com / Admin@2025

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## API Endpoints

All endpoints prefixed with `/api/v1/`

| Module | Endpoints |
|--------|-----------|
| Auth | POST /auth/register, /auth/login, GET /auth/profile |
| Applicants | CRUD /applicants, GET /applicants/stats |
| Trainees | CRUD /trainees, POST /trainees/from-applicant/:id |
| Employees | CRUD /employees, GET /employees/stats/* |
| Documents | CRUD /documents, GET /documents/employee/:id |
| Attendance | CRUD /attendance, POST /attendance/clock-in, /clock-out |
| Payroll | POST /payroll/generate, CRUD /payroll |
| Exit Clearance | CRUD /exit-clearance, POST /exit-clearance/clear-item |
| Dashboard | GET /dashboard/stats, /dashboard/charts/* |
| AI | POST /ai/chat, /ai/parse-resume, /ai/generate-jd, /ai/generate-review, /ai/employee-insight |

## User Roles

super_admin, hr_admin, hr_staff, payroll_admin, recruitment, manager, employee, viewer
