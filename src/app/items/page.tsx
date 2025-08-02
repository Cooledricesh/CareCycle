'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, TestTube, Syringe, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Item {
  id: string;
  name: string;
  category: 'test' | 'injection';
  cycle_value: number;
  cycle_unit: 'weeks' | 'months';
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ItemFormData {
  name: string;
  category: 'test' | 'injection';
  cycle_value: number;
  cycle_unit: 'weeks' | 'months';
  description: string;
}

const initialFormData: ItemFormData = {
  name: '',
  category: 'test',
  cycle_value: 1,
  cycle_unit: 'weeks',
  description: '',
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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
        description: '항목을 불러오는데 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cycle_value: Number(formData.cycle_value),
          description: formData.description || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '항목 저장에 실패했습니다');
      }

      toast({
        title: '성공',
        description: editingItem ? '항목이 수정되었습니다' : '새 항목이 추가되었습니다',
      });

      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData(initialFormData);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '항목 저장에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      cycle_value: item.cycle_value,
      cycle_unit: item.cycle_unit,
      description: item.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '항목 삭제에 실패했습니다');
      }

      toast({
        title: '성공',
        description: '항목이 삭제되었습니다',
      });

      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '항목 삭제에 실패했습니다',
        variant: 'destructive',
      });
    }
  };

  const itemsByCategory = {
    test: items.filter(item => item.category === 'test'),
    injection: items.filter(item => item.category === 'injection'),
  };

  const ItemForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">항목 이름</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="예: 심리검사, 뇌파검사"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <Select
          value={formData.category}
          onValueChange={(value: 'test' | 'injection') => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">검사</SelectItem>
            <SelectItem value="injection">주사</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cycle_value">주기 값</Label>
          <Input
            id="cycle_value"
            type="number"
            min="1"
            value={formData.cycle_value}
            onChange={(e) => setFormData({ ...formData, cycle_value: parseInt(e.target.value) || 1 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycle_unit">주기 단위</Label>
          <Select
            value={formData.cycle_unit}
            onValueChange={(value: 'weeks' | 'months') => setFormData({ ...formData, cycle_unit: value })}
          >
            <SelectTrigger id="cycle_unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weeks">주</SelectItem>
              <SelectItem value="months">개월</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명 (선택)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="이 항목에 대한 추가 설명을 입력하세요"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
            setEditingItem(null);
          }}
          disabled={submitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '저장 중...' : editingItem ? '수정' : '추가'}
        </Button>
      </DialogFooter>
    </form>
  );

  const ItemCard = ({ item }: { item: Item }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {item.category === 'test' ? (
                <TestTube className="h-4 w-4 text-blue-600" />
              ) : (
                <Syringe className="h-4 w-4 text-purple-600" />
              )}
              <h3 className="font-semibold">{item.name}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {item.cycle_value}{item.cycle_unit === 'weeks' ? '주' : '개월'} 주기
              </Badge>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>항목을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{item.name}" 항목을 삭제하면 되돌릴 수 없습니다.
                    단, 환자 일정에서 사용 중인 항목은 삭제할 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(item)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container px-4 py-4 md:py-8 mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">항목 관리</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              검사 및 주사 항목을 관리합니다
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 항목 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 항목 추가</DialogTitle>
                <DialogDescription>
                  검사 또는 주사 항목을 추가합니다
                </DialogDescription>
              </DialogHeader>
              <ItemForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">항목을 불러오는 중...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              전체 ({items.length})
            </TabsTrigger>
            <TabsTrigger value="test">
              검사 ({itemsByCategory.test.length})
            </TabsTrigger>
            <TabsTrigger value="injection">
              주사 ({itemsByCategory.injection.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">등록된 항목이 없습니다</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    첫 항목 추가하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            {itemsByCategory.test.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">등록된 검사 항목이 없습니다</p>
                  <Button
                    onClick={() => {
                      setFormData({ ...initialFormData, category: 'test' });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    검사 항목 추가
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {itemsByCategory.test.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="injection" className="space-y-4">
            {itemsByCategory.injection.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">등록된 주사 항목이 없습니다</p>
                  <Button
                    onClick={() => {
                      setFormData({ ...initialFormData, category: 'injection' });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    주사 항목 추가
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {itemsByCategory.injection.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>항목 수정</DialogTitle>
            <DialogDescription>
              항목 정보를 수정합니다
            </DialogDescription>
          </DialogHeader>
          <ItemForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}