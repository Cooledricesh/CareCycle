'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';

interface Patient {
  id: string;
  patient_number: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container px-4 py-4 md:py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">환자 관리</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            등록된 환자 목록을 확인하고 관리합니다.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/patients/new')}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          신규 환자 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="이름 또는 환자 번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 md:p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm md:text-base">{patient.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        환자 번호: {patient.patient_number}
                      </p>
                      {patient.phone && (
                        <p className="text-xs md:text-sm text-muted-foreground">
                          연락처: {patient.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        등록일: {new Date(patient.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}