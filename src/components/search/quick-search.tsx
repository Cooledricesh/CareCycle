'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { debounce } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  patient_number: string;
}

export function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchPatients = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.patients || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    searchPatients(value);
  };

  const handleSelectPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`);
    setQuery('');
    setShowResults(false);
  };

  const handleViewAllPatients = () => {
    router.push('/patients');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          빠른 환자 검색
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="환자 이름 또는 번호로 검색..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <Button onClick={handleViewAllPatients} variant="outline">
              전체 환자
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-auto">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  className="w-full px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 text-left transition-colors border-b last:border-b-0"
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">환자번호: {patient.patient_number}</div>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showResults && query.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}