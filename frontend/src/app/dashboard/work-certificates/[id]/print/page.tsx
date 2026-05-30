'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Printer, Loader2, FileCheck } from 'lucide-react';

import { Button, Card } from '@/components/ui';
import { useWorkspace } from '@/hooks/useWorkspace';

interface CertRecord {
  id: string;
  certificateNumber?: string;
  certificateType: string;
  requestDate: string;
  releaseDate?: string;
  purpose?: string;
  addressedTo?: string;
  remarks?: string;
  status: string;
  employee?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    employeeId: string;
    position?: string;
    department?: string;
    dateHired?: string;
    dateSeparated?: string;
    employmentStatus?: string;
    basicSalary?: number;
    presentAddress?: string;
  };
}

const TEMPLATE_TITLE: Record<string, string> = {
  certificate_of_employment: 'CERTIFICATE OF EMPLOYMENT',
  coe_with_compensation:     'CERTIFICATE OF EMPLOYMENT WITH COMPENSATION',
  service_record:            'SERVICE RECORD',
  salary_certification:      'CERTIFICATE OF COMPENSATION',
  good_moral:                'CERTIFICATE OF GOOD MORAL CHARACTER',
  work_experience:           'WORK EXPERIENCE CERTIFICATE',
  other:                     'CERTIFICATE',
};

/**
 * Print-optimized certificate view. Auto-fills the template from the
 * employee's record (name, position, dept, dates, salary) and opens
 * cleanly in window.print() / Save as PDF.
 */
export default function PrintCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [cert, setCert] = useState<CertRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/work-certificates/${params.id}`)
      .then((r) => setCert(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading certificate…
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center py-20 text-rose-600 text-sm">Certificate not found</div>
    );
  }

  const emp = cert.employee;
  const fullName = emp ? [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ') : '—';
  const title = TEMPLATE_TITLE[cert.certificateType] || 'CERTIFICATE';
  const today = new Date(cert.releaseDate || cert.requestDate || Date.now());

  // Pick body template from cert type
  const body = buildBody(cert);

  return (
    <>
      {/* ── Print-only styles ── */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 1in; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; padding: 0 !important; max-width: none !important; }
          body { background: white !important; }
          [data-sidebar-style] aside, header { display: none !important; }
        }
      `}</style>

      {/* ── Print toolbar (hidden when printing) ── */}
      <div className="no-print sticky top-0 z-20 bg-white border-b border-surface-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Button
          variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => router.push('/dashboard/work-certificates')}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* ── Letterhead document ── */}
      <div className="print-container max-w-3xl mx-auto bg-white shadow-card my-8 px-12 py-16 print:my-0 print:shadow-none">
        {/* Letterhead */}
        <header className="text-center mb-12">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft mx-auto mb-3">
            {workspace.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <FileCheck className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="text-xl font-bold text-surface-900 tracking-tight">{workspace.companyName}</div>
          <div className="text-2xs text-surface-500 mt-0.5">Human Resources Department</div>
        </header>

        {/* Cert number */}
        {cert.certificateNumber && (
          <div className="text-right text-2xs font-mono text-surface-500 mb-6">
            Ref: <span className="text-surface-900 font-semibold">{cert.certificateNumber}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-center tracking-wider text-surface-900 mb-8 underline underline-offset-8 decoration-2">
          {title}
        </h1>

        {/* Date */}
        <div className="mb-8 text-sm text-surface-800">
          <p>{today.toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Addressee */}
        {cert.addressedTo && (
          <div className="mb-6 text-sm text-surface-800">
            <p className="font-semibold">{cert.addressedTo}</p>
          </div>
        )}

        {/* Salutation */}
        <p className="text-sm text-surface-800 mb-4">To Whom It May Concern:</p>

        {/* Body */}
        <div className="text-sm text-surface-800 leading-relaxed space-y-4 mb-10">
          {body}
        </div>

        {/* Purpose */}
        {cert.purpose && (
          <p className="text-sm text-surface-800 mb-8">
            This certification is issued upon the request of the above-named employee for the purpose of <strong>{cert.purpose}</strong>.
          </p>
        )}

        {/* Signature block */}
        <div className="mt-16">
          <div className="text-sm text-surface-800">
            <p className="mb-12">Respectfully,</p>
            <div className="w-64">
              <div className="border-b border-surface-900 mb-1" />
              <p className="font-bold text-surface-900">HR Manager</p>
              <p className="text-xs text-surface-600">{workspace.companyName}</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <footer className="mt-16 pt-4 border-t border-surface-200 text-2xs text-surface-400 text-center">
          This certificate is system-generated. Verify authenticity by contacting HR.
        </footer>
      </div>
    </>
  );
}

// ─── Body templates per certificate type ───
function buildBody(cert: CertRecord): React.ReactNode {
  const emp = cert.employee;
  if (!emp) return <p>Employee details not found.</p>;

  const fullName = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ');
  const hired = emp.dateHired ? new Date(emp.dateHired).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const separated = emp.dateSeparated ? new Date(emp.dateSeparated).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const isActive = !separated;
  const salary = emp.basicSalary ? `₱${Number(emp.basicSalary).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : null;

  switch (cert.certificateType) {
    case 'certificate_of_employment':
      return (
        <>
          <p>
            This is to certify that <strong>{fullName}</strong> {isActive ? 'is currently employed' : 'was employed'} with{' '}
            <strong>{cert.employee?.position ? cert.employee.position : 'this organization'}</strong>
            {emp.department && <> in the <strong>{emp.department}</strong> department</>}
            {' '}from <strong>{hired}</strong>{separated && <> to <strong>{separated}</strong></>}.
          </p>
          <p>
            Employee number: <strong>{emp.employeeId}</strong>.
            Employment status: <strong className="capitalize">{(emp.employmentStatus || '').replace(/_/g, ' ') || (isActive ? 'Active' : 'Separated')}</strong>.
          </p>
        </>
      );

    case 'coe_with_compensation':
    case 'salary_certification':
      return (
        <>
          <p>
            This is to certify that <strong>{fullName}</strong> {isActive ? 'is currently employed' : 'was employed'} as{' '}
            <strong>{emp.position || '—'}</strong>{emp.department && <> in the <strong>{emp.department}</strong> department</>}
            {' '}from <strong>{hired}</strong>{separated && <> to <strong>{separated}</strong></>}.
          </p>
          <p>
            {isActive ? 'They currently earn' : 'Their last basic monthly compensation was'} a basic monthly compensation of{' '}
            <strong>{salary || 'an amount on file with HR'}</strong>.
          </p>
        </>
      );

    case 'service_record':
      return (
        <>
          <p>
            This is the official Service Record of <strong>{fullName}</strong> (Employee ID: <strong>{emp.employeeId}</strong>).
          </p>
          <table className="w-full text-xs mt-4 border border-surface-300">
            <tbody>
              <Row label="Position" value={emp.position} />
              <Row label="Department" value={emp.department} />
              <Row label="Date Hired" value={hired} />
              {emp.dateSeparated && <Row label="Date Separated" value={separated!} />}
              <Row label="Employment Status" value={(emp.employmentStatus || '').replace(/_/g, ' ')} />
            </tbody>
          </table>
        </>
      );

    case 'good_moral':
      return (
        <p>
          This is to certify that <strong>{fullName}</strong> (Employee ID: <strong>{emp.employeeId}</strong>)
          {' '}has shown <strong>good moral character</strong> throughout {isActive ? 'their' : 'their'} engagement with this organization
          {' '}from <strong>{hired}</strong>{separated && <> until <strong>{separated}</strong></>}.
          {' '}{cert.remarks || 'No record of disciplinary action against the said employee exists in their personnel file.'}
        </p>
      );

    case 'work_experience':
      return (
        <p>
          This certifies that <strong>{fullName}</strong> has worked at this organization as{' '}
          <strong>{emp.position || '—'}</strong>{emp.department && <> in the <strong>{emp.department}</strong> department</>}
          {' '}from <strong>{hired}</strong>{separated ? <> to <strong>{separated}</strong></> : <>{' '}to the present</>}.
          {' '}During their tenure, they have demonstrated competence in their assigned duties and responsibilities.
        </p>
      );

    default:
      return (
        <>
          <p>
            This is to certify that <strong>{fullName}</strong> (Employee ID: <strong>{emp.employeeId}</strong>)
            {' '}{isActive ? 'is currently employed' : 'was employed'} with this organization
            {' '}from <strong>{hired}</strong>{separated && <> to <strong>{separated}</strong></>}.
          </p>
          {cert.remarks && <p>{cert.remarks}</p>}
        </>
      );
  }
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <tr className="border-b border-surface-200">
      <td className="px-3 py-2 font-semibold w-1/3 bg-surface-50">{label}</td>
      <td className="px-3 py-2">{value || '—'}</td>
    </tr>
  );
}
