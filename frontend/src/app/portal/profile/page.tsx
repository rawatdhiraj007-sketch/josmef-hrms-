'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  User, Mail, Phone, Briefcase, Calendar, MapPin, Shield, Building2,
  Loader2, AtSign, Info,
} from 'lucide-react';

import { Badge, Card } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';
import { InfoRow } from '@/components/detail';

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'neutral' | 'danger' | 'info'> = {
  probationary:    'warning',
  regular:         'success',
  resigned:        'neutral',
  terminated:      'danger',
  end_of_contract: 'warning',
  awol:            'danger',
};

export default function PortalProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/me')
      .then((r) => setMe(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="text-center py-20 text-rose-600 text-sm">Profile not found</div>
    );
  }

  const fullName = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ');

  return (
    <div className="space-y-5">
      {/* ── Profile hero card ── */}
      <Card padding="none" className="overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 sm:h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 relative">
          <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>
        {/* Avatar + identity */}
        <div className="px-5 sm:px-6 pb-5 -mt-10 sm:-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          <Avatar name={fullName} size="xl" className="ring-4 ring-white shadow-lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">{fullName}</h1>
              {me.employmentStatus && (
                <Badge variant={STATUS_VARIANT[me.employmentStatus] ?? 'neutral'} dot>
                  {me.employmentStatus.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-surface-600 flex items-center gap-1.5 flex-wrap">
              <Briefcase className="w-3.5 h-3.5 text-surface-400" />
              <span>{me.position || '—'}</span>
              {me.department && (
                <>
                  <span aria-hidden className="text-surface-300">·</span>
                  <span>{me.department}</span>
                </>
              )}
            </p>
            {me.employeeId && (
              <p className="text-2xs text-primary-700 font-mono font-semibold uppercase tracking-wider mt-1.5">
                ID: {me.employeeId}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Info-only notice ── */}
      <div className="px-4 py-3 rounded-xl bg-primary-50/60 border border-primary-200/60 text-primary-900 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" />
        <span>This is your read-only profile. To update any of these details, please contact HR.</span>
      </div>

      {/* ── Detail cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" /> Personal
          </h2>
          <div className="space-y-3">
            <InfoRow icon={AtSign}   label="Email"  value={me.email} />
            <InfoRow icon={Phone}    label="Mobile" value={me.mobile} mono />
            <InfoRow icon={Calendar} label="Date of Birth" value={me.dateOfBirth?.split('T')[0]} />
            <InfoRow                 label="Gender" value={me.gender} />
            <InfoRow                 label="Civil Status" value={me.civilStatus} />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" /> Employment
          </h2>
          <div className="space-y-3">
            <InfoRow icon={Briefcase} label="Position"     value={me.position} />
            <InfoRow                  label="Department"   value={me.department} />
            <InfoRow                  label="Branch"       value={me.branch} />
            <InfoRow icon={Calendar}  label="Date Hired"   value={me.dateHired ? new Date(me.dateHired).toLocaleDateString() : undefined} />
            <InfoRow                  label="Contract End" value={me.contractEndDate ? new Date(me.contractEndDate).toLocaleDateString() : undefined} />
          </div>
        </Card>

        {(me.presentAddress || me.permanentAddress || me.city) && (
          <Card>
            <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" /> Address
            </h2>
            <div className="space-y-3">
              <InfoRow icon={MapPin} label="Present"   value={me.presentAddress} />
              <InfoRow icon={MapPin} label="Permanent" value={me.permanentAddress} />
              <InfoRow               label="City"      value={[me.city, me.province, me.zipCode].filter(Boolean).join(', ')} />
            </div>
          </Card>
        )}

        {(me.sssNumber || me.philhealthNumber || me.pagibigNumber || me.tinNumber) && (
          <Card>
            <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-600" /> Government IDs
            </h2>
            <div className="space-y-3">
              <InfoRow icon={Shield} label="SSS"        value={me.sssNumber}        mono />
              <InfoRow               label="PhilHealth" value={me.philhealthNumber} mono />
              <InfoRow               label="Pag-IBIG"   value={me.pagibigNumber}    mono />
              <InfoRow               label="TIN"        value={me.tinNumber}        mono />
            </div>
          </Card>
        )}

        {(me.emergencyContactName || me.emergencyContactPhone) && (
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-600" /> Emergency Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoRow               label="Name"     value={me.emergencyContactName} />
              <InfoRow               label="Relation" value={me.emergencyContactRelation} />
              <InfoRow icon={Phone}  label="Phone"    value={me.emergencyContactPhone} mono />
            </div>
          </Card>
        )}
      </div>

      {/* ── Footer note ── */}
      <p className="text-2xs text-surface-400 text-center pt-2">
        Need an update? Email HR at <a href="mailto:hr@nextnova.app" className="text-primary-600 hover:underline">hr@nextnova.app</a> with your Employee ID.
      </p>
    </div>
  );
}
