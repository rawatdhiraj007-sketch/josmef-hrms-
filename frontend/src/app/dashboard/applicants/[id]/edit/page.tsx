'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Applicant } from '@/types/applicant';
import ApplicantForm from '@/components/applicants/ApplicantForm';

export default function EditApplicantPage() {
  const params = useParams();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/applicants/${params.id}`)
      .then((res) => setApplicant(res.data))
      .catch(() => alert('Applicant not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!applicant) return <div className="text-center py-12 text-red-500">Applicant not found</div>;

  return <ApplicantForm applicant={applicant} mode="edit" />;
}
