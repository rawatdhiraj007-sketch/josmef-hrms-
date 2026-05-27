'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Employee } from '@/types/employee';
import EmployeeForm from '@/components/employees/EmployeeForm';

export default function EditEmployeePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/employees/${params.id}`)
      .then((res) => setEmployee(res.data))
      .catch(() => alert('Employee not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!employee) return <div className="text-center py-12 text-red-500">Not found</div>;
  return <EmployeeForm employee={employee} mode="edit" />;
}
