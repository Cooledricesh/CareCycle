'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: 'test' | 'injection';
  cycle_value: number;
  cycle_unit: 'weeks' | 'months';
}

interface ScheduleInput {
  item_id: string;
  first_implementation_date: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    patient_number: '',
    name: '',
    phone: '',
    notes: '',
  });
  const [schedules, setSchedules] = useState<ScheduleInput[]>([
    { item_id: '', first_implementation_date: '' },
  ]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: '오류',
        description: '관리 항목을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const addSchedule = () => {
    setSchedules([...schedules, { item_id: '', first_implementation_date: '' }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof ScheduleInput, value: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patient_number || !formData.name) {
      toast({
        title: '입력 오류',
        description: '환자 번호와 이름은 필수 입력 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    const validSchedules = schedules.filter(s => s.item_id && s.first_implementation_date);
    if (validSchedules.length === 0) {
      toast({
        title: '입력 오류',
        description: '최소 하나의 일정을 등록해야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          schedules: validSchedules,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '환자 등록에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: '환자가 성공적으로 등록되었습니다.',
      });

      // Redirect to patient list or detail page
      router.push('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '환자 등록에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>신규 환자 등록</CardTitle>
          <CardDescription>
            환자 정보와 관리 일정을 등록합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">환자 정보</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_number">환자 번호 *</Label>
                  <Input
                    id="patient_number"
                    value={formData.patient_number}
                    onChange={(e) => setFormData({ ...formData, patient_number: e.target.value })}
                    placeholder="P001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="특이사항을 입력하세요"
                  rows={3}
                />
              </div>
            </div>

            {/* Schedules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">관리 일정</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSchedule}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  일정 추가
                </Button>
              </div>
              
              {schedules.map((schedule, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>관리 항목</Label>
                    <Select
                      value={schedule.item_id}
                      onValueChange={(value) => updateSchedule(index, 'item_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="항목 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.category === 'test' ? '검사' : '주사'}, {item.cycle_value}{item.cycle_unit === 'weeks' ? '주' : '개월'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label>최초 시행일</Label>
                    <Input
                      type="date"
                      value={schedule.first_implementation_date}
                      onChange={(e) => updateSchedule(index, 'first_implementation_date', e.target.value)}
                    />
                  </div>
                  
                  {schedules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSchedule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}