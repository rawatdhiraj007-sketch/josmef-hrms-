'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Trainee } from '@/types/trainee';
import TraineeForm from '@/components/trainees/TraineeForm';

export default function EditTraineePage() {
  const params = useParams();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/trainees/${params.id}`)
      .then((res) => setTrainee(res.data))
      .catch(() => alert('Trainee not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!trainee) return <div className="text-center py-12 text-red-500">Not found</div>;
  return <TraineeForm trainee={trainee} mode="edit" />;
}
