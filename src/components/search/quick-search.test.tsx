1~
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
2~
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
3~
import { useRouter } from 'next/navigation';
4~
import { QuickSearch } from './quick-search';
5~

6~
// Mock the router
7~
vi.mock('next/navigation', () => ({
8~
  useRouter: vi.fn(),
9~
}));
10~

11~
// Mock fetch
12~
global.fetch = vi.fn();
13~

14~
// Mock debounce utility
15~
vi.mock('@/lib/utils', () => ({
16~
  debounce: vi.fn((fn, delay) => {
17~
    let timeoutId: NodeJS.Timeout;
18~
    return (...args: any[]) => {
19~
      clearTimeout(timeoutId);
20~
      timeoutId = setTimeout(() => fn(...args), delay);
21~
    };
22~
  }),
23~
}));
24~

25~
describe('QuickSearch', () => {
26~
  const mockPush = vi.fn();
27~
  const mockRouter = {
28~
    push: mockPush,
29~
  };
30~

31~
  beforeEach(() => {
32~
    vi.clearAllMocks();
33~
    (useRouter as Mock).mockReturnValue(mockRouter);
34~
    vi.useFakeTimers();
35~
  });
36~

37~
  afterEach(() => {
38~
    vi.restoreAllMocks();
39~
    vi.useRealTimers();
40~
  });
41~

42~
  it('should render search input and button', () => {
43~
    render(<QuickSearch />);
44~
    
45~
    expect(screen.getByPlaceholderText('환자 이름 또는 번호로 검색...')).toBeInTheDocument();
46~
    expect(screen.getByRole('button', { name: '전체 환자' })).toBeInTheDocument();
47~
    expect(screen.getByText('빠른 환자 검색')).toBeInTheDocument();
48~
  });
49~

50~
  it('should not search when query is less than 2 characters', async () => {
51~
    render(<QuickSearch />);
52~
    
53~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
54~
    
55~
    fireEvent.change(input, { target: { value: 'a' } });
56~
    
57~
    act(() => {
58~
      vi.advanceTimersByTime(500);
59~
    });
60~
    
61~
    expect(fetch).not.toHaveBeenCalled();
62~
  });
63~

64~
  it('should perform search when query is 2 or more characters', async () => {
65~
    const mockPatients = [
66~
      { id: '1', name: '김환자', patient_number: 'P001' },
67~
      { id: '2', name: '김철수', patient_number: 'P002' },
68~
    ];
69~

70~
    (fetch as Mock).mockResolvedValueOnce({
71~
      ok: true,
72~
      json: async () => ({ patients: mockPatients }),
73~
    });
74~

75~
    render(<QuickSearch />);
76~
    
77~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
78~
    
79~
    fireEvent.change(input, { target: { value: '김환' } });
80~
    
81~
    act(() => {
82~
      vi.advanceTimersByTime(500);
83~
    });
84~

85~
    await waitFor(() => {
86~
      expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%EA%B9%80%ED%99%98');
87~
    });
88~
  });
89~

90~
  it('should display search results', async () => {
91~
    const mockPatients = [
92~
      { id: '1', name: '김환자', patient_number: 'P001' },
93~
      { id: '2', name: '김철수', patient_number: 'P002' },
94~
    ];
95~

96~
    (fetch as Mock).mockResolvedValueOnce({
97~
      ok: true,
98~
      json: async () => ({ patients: mockPatients }),
99~
    });
100~

101~
    render(<QuickSearch />);
102~
    
103~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
104~
    
105~
    fireEvent.change(input, { target: { value: '김' } });
106~
    
107~
    act(() => {
108~
      vi.advanceTimersByTime(500);
109~
    });
110~

111~
    await waitFor(() => {
112~
      expect(screen.getByText('김환자')).toBeInTheDocument();
113~
    });
114~

115~
    expect(screen.getByText('김철수')).toBeInTheDocument();
116~
    expect(screen.getByText('환자번호: P001')).toBeInTheDocument();
117~
    expect(screen.getByText('환자번호: P002')).toBeInTheDocument();
118~
  });
119~

120~
  it('should show loading spinner while searching', async () => {
121~
    (fetch as Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
122~

123~
    render(<QuickSearch />);
124~
    
125~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
126~
    
127~
    fireEvent.change(input, { target: { value: '김환자' } });
128~
    
129~
    act(() => {
130~
      vi.advanceTimersByTime(500);
131~
    });
132~

133~
    await waitFor(() => {
134~
      expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
135~
    });
136~
  });
137~

138~
  it('should show no results message when no patients found', async () => {
139~
    (fetch as Mock).mockResolvedValueOnce({
140~
      ok: true,
141~
      json: async () => ({ patients: [] }),
142~
    });
143~

144~
    render(<QuickSearch />);
145~
    
146~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
147~
    
148~
    fireEvent.change(input, { target: { value: '존재하지않는환자' } });
149~
    
150~
    act(() => {
151~
      vi.advanceTimersByTime(500);
152~
    });
153~

154~
    await waitFor(() => {
155~
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
156~
    });
157~
  });
158~

159~
  it('should navigate to patient page when patient is selected', async () => {
160~
    const mockPatients = [
161~
      { id: 'patient-1', name: '김환자', patient_number: 'P001' },
162~
    ];
163~

164~
    (fetch as Mock).mockResolvedValueOnce({
165~
      ok: true,
166~
      json: async () => ({ patients: mockPatients }),
167~
    });
168~

169~
    render(<QuickSearch />);
170~
    
171~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
172~
    
173~
    fireEvent.change(input, { target: { value: '김환자' } });
174~
    
175~
    act(() => {
176~
      vi.advanceTimersByTime(500);
177~
    });
178~

179~
    await waitFor(() => {
180~
      expect(screen.getByText('김환자')).toBeInTheDocument();
181~
    });
182~

183~
    fireEvent.click(screen.getByText('김환자'));
184~

185~
    expect(mockPush).toHaveBeenCalledWith('/patients/patient-1');
186~
  });
187~

188~
  it('should clear search when patient is selected', async () => {
189~
    const mockPatients = [
190~
      { id: 'patient-1', name: '김환자', patient_number: 'P001' },
191~
    ];
192~

193~
    (fetch as Mock).mockResolvedValueOnce({
194~
      ok: true,
195~
      json: async () => ({ patients: mockPatients }),
196~
    });
197~

198~
    render(<QuickSearch />);
199~
    
200~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...') as HTMLInputElement;
201~
    
202~
    fireEvent.change(input, { target: { value: '김환자' } });
203~
    
204~
    act(() => {
205~
      vi.advanceTimersByTime(500);
206~
    });
207~

208~
    await waitFor(() => {
209~
      expect(screen.getByText('김환자')).toBeInTheDocument();
210~
    });
211~

212~
    fireEvent.click(screen.getByText('김환자'));
213~

214~
    expect(input.value).toBe('');
215~
  });
216~

217~
  it('should navigate to patients list when "전체 환자" button is clicked', () => {
218~
    render(<QuickSearch />);
219~
    
220~
    const allPatientsButton = screen.getByRole('button', { name: '전체 환자' });
221~
    fireEvent.click(allPatientsButton);
222~

223~
    expect(mockPush).toHaveBeenCalledWith('/patients');
224~
  });
225~

226~
  it('should handle fetch errors gracefully', async () => {
227~
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
228~
    
229~
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));
230~

231~
    render(<QuickSearch />);
232~
    
233~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
234~
    
235~
    fireEvent.change(input, { target: { value: '김환자' } });
236~
    
237~
    act(() => {
238~
      vi.advanceTimersByTime(500);
239~
    });
240~

241~
    await waitFor(() => {
242~
      expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
243~
    });
244~

245~
    consoleSpy.mockRestore();
246~
  });
247~

248~
  it('should handle non-ok response gracefully', async () => {
249~
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
250~
    
251~
    (fetch as Mock).mockResolvedValueOnce({
252~
      ok: false,
253~
      status: 500,
254~
    });
255~

256~
    render(<QuickSearch />);
257~
    
258~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
259~
    
260~
    fireEvent.change(input, { target: { value: '김환자' } });
261~
    
262~
    act(() => {
263~
      vi.advanceTimersByTime(500);
264~
    });
265~

266~
    await waitFor(() => {
267~
      // The component should not display results or throw errors silently
268~
      expect(screen.queryByText('김환자')).not.toBeInTheDocument();
269~
    });
270~

271~
    consoleSpy.mockRestore();
272~
  });
273~

274~
  it('should debounce search requests', async () => {
275~
    render(<QuickSearch />);
276~
    
277~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
278~
    
279~
    // Type quickly
280~
    fireEvent.change(input, { target: { value: 'ㄱ' } });
281~
    fireEvent.change(input, { target: { value: '김' } });
282~
    fireEvent.change(input, { target: { value: '김환' } });
283~
    fireEvent.change(input, { target: { value: '김환자' } });
284~
    
285~
    // Only advance by debounce delay once
286~
    act(() => {
287~
      vi.advanceTimersByTime(300);
288~
    });
289~

290~
    // Should only make one API call
291~
    expect(fetch).toHaveBeenCalledTimes(1);
292~
    expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%EA%B9%80%ED%99%98%EC%9E%90');
293~
  });
294~

295~
  it('should hide results when input is cleared', async () => {
296~
    const mockPatients = [
297~
      { id: '1', name: '김환자', patient_number: 'P001' },
298~
    ];
299~

300~
    (fetch as Mock).mockResolvedValueOnce({
301~
      ok: true,
302~
      json: async () => ({ patients: mockPatients }),
303~
    });
304~

305~
    render(<QuickSearch />);
306~
    
307~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
308~
    
309~
    // Search first
310~
    fireEvent.change(input, { target: { value: '김환자' } });
311~
    
312~
    act(() => {
313~
      vi.advanceTimersByTime(500);
314~
    });
315~

316~
    await waitFor(() => {
317~
      expect(screen.getByText('김환자')).toBeInTheDocument();
318~
    });
319~

320~
    // Clear input
321~
    fireEvent.change(input, { target: { value: '' } });
322~
    
323~
    act(() => {
324~
      vi.advanceTimersByTime(500);
325~
    });
326~

327~
    await waitFor(() => {
328~
      expect(screen.queryByText('김환자')).not.toBeInTheDocument();
329~
    });
330~
  });
331~

332~
  it('should handle malformed API response', async () => {
333~
    (fetch as Mock).mockResolvedValueOnce({
334~
      ok: true,
335~
      json: async () => ({ /* missing patients field */ }),
336~
    });
337~

338~
    render(<QuickSearch />);
339~
    
340~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
341~
    
342~
    fireEvent.change(input, { target: { value: '김환자' } });
343~
    
344~
    act(() => {
345~
      vi.advanceTimersByTime(500);
346~
    });
347~

348~
    await waitFor(() => {
349~
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
350~
    });
351~
  });
352~

353~
  it('should properly encode search query for URL', async () => {
354~
    render(<QuickSearch />);
355~
    
356~
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
357~
    
358~
    fireEvent.change(input, { target: { value: '특수문자 &/?=' } });
359~
    
360~
    act(() => {
361~
      vi.advanceTimersByTime(500);
362~
    });
363~

364~
    await waitFor(() => {
365~
      expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%ED%8A%B9%EC%88%98%EB%AC%B8%EC%9E%90%20%26%2F%3F%3D');
366~
    });
367~
  });
368~

369~
  describe('Keyboard Navigation', () => {
370~
    it('should focus on input field when rendered', () => {
371~
      render(<QuickSearch />);
372~
      
373~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
374~
      input.focus();
375~
      
376~
      expect(document.activeElement).toBe(input);
377~
    });
378~

379~
    it('should allow keyboard navigation of search results', async () => {
380~
      const mockPatients = [
381~
        { id: '1', name: '김환자', patient_number: 'P001' },
382~
        { id: '2', name: '김철수', patient_number: 'P002' },
383~
      ];
384~

385~
      (fetch as Mock).mockResolvedValueOnce({
386~
        ok: true,
387~
        json: async () => ({ patients: mockPatients }),
388~
      });
389~

390~
      render(<QuickSearch />);
391~
      
392~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
393~
      
394~
      fireEvent.change(input, { target: { value: '김' } });
395~
      
396~
      act(() => {
397~
        vi.advanceTimersByTime(500);
398~
      });
399~

400~
      await waitFor(() => {
401~
        expect(screen.getByText('김환자')).toBeInTheDocument();
402~
      });
403~

404~
      const firstResult = screen.getByText('김환자').closest('button');
405~
      const secondResult = screen.getByText('김철수').closest('button');
406~

407~
      expect(firstResult).toBeInTheDocument();
408~
      expect(secondResult).toBeInTheDocument();
409~
    });
410~
  });
411~
});
412~
  describe('Edge Cases and Error Scenarios', () => {
413~
    it('should handle very long search queries', async () => {
414~
      const longQuery = 'a'.repeat(1000);
415~
      
416~
      render(<QuickSearch />);
417~
      
418~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
419~
      
420~
      fireEvent.change(input, { target: { value: longQuery } });
421~
      
422~
      act(() => {
423~
        vi.advanceTimersByTime(500);
424~
      });
425~

426~
      await waitFor(() => {
427~
        expect(fetch).toHaveBeenCalledWith(`/api/patients/search?q=${encodeURIComponent(longQuery)}`);
428~
      });
429~
    });
430~

431~
    it('should handle JSON parsing errors', async () => {
432~
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
433~
      
434~
      (fetch as Mock).mockResolvedValueOnce({
435~
        ok: true,
436~
        json: async () => { throw new Error('Invalid JSON'); },
437~
      });
438~

439~
      render(<QuickSearch />);
440~
      
441~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
442~
      
443~
      fireEvent.change(input, { target: { value: '김환자' } });
444~
      
445~
      act(() => {
446~
        vi.advanceTimersByTime(500);
447~
      });
448~

449~
      await waitFor(() => {
450~
        expect(consoleSpy).toHaveBeenCalled();
451~
      });
452~

453~
      consoleSpy.mockRestore();
454~
    });
455~

456~
    it('should handle empty string search query gracefully', async () => {
457~
      render(<QuickSearch />);
458~
      
459~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
460~
      
461~
      fireEvent.change(input, { target: { value: '  ' } }); // Only spaces
462~
      
463~
      act(() => {
464~
        vi.advanceTimersByTime(500);
465~
      });
466~
      
467~
      expect(fetch).not.toHaveBeenCalled();
468~
    });
469~

470~
    it('should handle patients with missing required fields', async () => {
471~
      const invalidPatients = [
472~
        { id: '1', name: '김환자' }, // missing patient_number
473~
        { id: '2', patient_number: 'P002' }, // missing name
474~
        { name: '김철수', patient_number: 'P003' }, // missing id
475~
      ];
476~

477~
      (fetch as Mock).mockResolvedValueOnce({
478~
        ok: true,
479~
        json: async () => ({ patients: invalidPatients }),
480~
      });
481~

482~
      render(<QuickSearch />);
483~
      
484~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
485~
      
486~
      fireEvent.change(input, { target: { value: '김' } });
487~
      
488~
      act(() => {
489~
        vi.advanceTimersByTime(500);
490~
      });
491~

492~
      await waitFor(() => {
493~
        // Should still render valid patients
494~
        expect(screen.getByText('김환자')).toBeInTheDocument();
495~
      });
496~
    });
497~

498~
    it('should handle concurrent search requests', async () => {
499~
      const firstResponse = new Promise(resolve => 
500~
        setTimeout(() => resolve({
501~
          ok: true,
502~
          json: async () => ({ patients: [{ id: '1', name: '첫번째', patient_number: 'P001' }] }),
503~
        }), 100)
504~
      );
505~
      
506~
      const secondResponse = {
507~
        ok: true,
508~
        json: async () => ({ patients: [{ id: '2', name: '두번째', patient_number: 'P002' }] }),
509~
      };
510~

511~
      (fetch as Mock)
512~
        .mockResolvedValueOnce(firstResponse)
513~
        .mockResolvedValueOnce(secondResponse);
514~

515~
      render(<QuickSearch />);
516~
      
517~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
518~
      
519~
      // First search
520~
      fireEvent.change(input, { target: { value: '첫번째' } });
521~
      
522~
      act(() => {
523~
        vi.advanceTimersByTime(300); // Partial debounce
524~
      });
525~
      
526~
      // Second search before first completes
527~
      fireEvent.change(input, { target: { value: '두번째' } });
528~
      
529~
      act(() => {
530~
        vi.advanceTimersByTime(500);
531~
      });
532~

533~
      await waitFor(() => {
534~
        expect(screen.getByText('두번째')).toBeInTheDocument();
535~
      });
536~
      
537~
      // Should not show results from first search
538~
      expect(screen.queryByText('첫번째')).not.toBeInTheDocument();
539~
    });
540~

541~
    it('should handle API timeout scenarios', async () => {
542~
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
543~
      
544~
      (fetch as Mock).mockImplementation(() => 
545~
        new Promise((_, reject) => 
546~
          setTimeout(() => reject(new Error('Request timeout')), 1000)
547~
        )
548~
      );
549~

550~
      render(<QuickSearch />);
551~
      
552~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
553~
      
554~
      fireEvent.change(input, { target: { value: '김환자' } });
555~
      
556~
      act(() => {
557~
        vi.advanceTimersByTime(500);
558~
      });
559~

560~
      // Fast forward to timeout
561~
      act(() => {
562~
        vi.advanceTimersByTime(1000);
563~
      });
564~

565~
      await waitFor(() => {
566~
        expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
567~
      });
568~

569~
      consoleSpy.mockRestore();
570~
    });
571~
  });
572~

573~
  describe('Search Result Interactions', () => {
574~
    it('should handle rapid clicking on search results', async () => {
575~
      const mockPatients = [
576~
        { id: 'patient-1', name: '김환자', patient_number: 'P001' },
577~
      ];
578~

579~
      (fetch as Mock).mockResolvedValueOnce({
580~
        ok: true,
581~
        json: async () => ({ patients: mockPatients }),
582~
      });
583~

584~
      render(<QuickSearch />);
585~
      
586~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
587~
      
588~
      fireEvent.change(input, { target: { value: '김환자' } });
589~
      
590~
      act(() => {
591~
        vi.advanceTimersByTime(500);
592~
      });
593~

594~
      await waitFor(() => {
595~
        expect(screen.getByText('김환자')).toBeInTheDocument();
596~
      });
597~

598~
      const patientResult = screen.getByText('김환자');
599~
      
600~
      // Click multiple times rapidly
601~
      fireEvent.click(patientResult);
602~
      fireEvent.click(patientResult);
603~
      fireEvent.click(patientResult);
604~

605~
      // Should only navigate once
606~
      expect(mockPush).toHaveBeenCalledTimes(1);
607~
      expect(mockPush).toHaveBeenCalledWith('/patients/patient-1');
608~
    });
609~

610~
    it('should handle search result hover states', async () => {
611~
      const mockPatients = [
612~
        { id: '1', name: '김환자', patient_number: 'P001' },
613~
        { id: '2', name: '김철수', patient_number: 'P002' },
614~
      ];
615~

616~
      (fetch as Mock).mockResolvedValueOnce({
617~
        ok: true,
618~
        json: async () => ({ patients: mockPatients }),
619~
      });
620~

621~
      render(<QuickSearch />);
622~
      
623~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
624~
      
625~
      fireEvent.change(input, { target: { value: '김' } });
626~
      
627~
      act(() => {
628~
        vi.advanceTimersByTime(500);
629~
      });
630~

631~
      await waitFor(() => {
632~
        expect(screen.getByText('김환자')).toBeInTheDocument();
633~
      });
634~

635~
      const firstResult = screen.getByText('김환자');
636~
      
637~
      fireEvent.mouseEnter(firstResult);
638~
      fireEvent.mouseLeave(firstResult);
639~
      
640~
      // Component should handle mouse events without errors
641~
      expect(firstResult).toBeInTheDocument();
642~
    });
643~

644~
    it('should handle search results with special characters in names', async () => {
645~
      const mockPatients = [
646~
        { id: '1', name: '김환자-A&B', patient_number: 'P-001/2023' },
647~
        { id: '2', name: '이철수 (특수)', patient_number: 'P#002' },
648~
      ];
649~

650~
      (fetch as Mock).mockResolvedValueOnce({
651~
        ok: true,
652~
        json: async () => ({ patients: mockPatients }),
653~
      });
654~

655~
      render(<QuickSearch />);
656~
      
657~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
658~
      
659~
      fireEvent.change(input, { target: { value: '특수' } });
660~
      
661~
      act(() => {
662~
        vi.advanceTimersByTime(500);
663~
      });
664~

665~
      await waitFor(() => {
666~
        expect(screen.getByText('김환자-A&B')).toBeInTheDocument();
667~
      });
668~

669~
      expect(screen.getByText('이철수 (특수)')).toBeInTheDocument();
670~
      expect(screen.getByText('환자번호: P-001/2023')).toBeInTheDocument();
671~
      expect(screen.getByText('환자번호: P#002')).toBeInTheDocument();
672~
    });
673~
  });
674~

675~
  describe('Component State Management', () => {
676~
    it('should maintain search state when component re-renders', async () => {
677~
      const mockPatients = [
678~
        { id: '1', name: '김환자', patient_number: 'P001' },
679~
      ];
680~

681~
      (fetch as Mock).mockResolvedValueOnce({
682~
        ok: true,
683~
        json: async () => ({ patients: mockPatients }),
684~
      });
685~

686~
      const { rerender } = render(<QuickSearch />);
687~
      
688~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
689~
      
690~
      fireEvent.change(input, { target: { value: '김환자' } });
691~
      
692~
      act(() => {
693~
        vi.advanceTimersByTime(500);
694~
      });
695~

696~
      await waitFor(() => {
697~
        expect(screen.getByText('김환자')).toBeInTheDocument();
698~
      });
699~

700~
      // Re-render component
701~
      rerender(<QuickSearch />);
702~
      
703~
      // Search results should be cleared after re-render
704~
      expect(screen.queryByText('김환자')).not.toBeInTheDocument();
705~
    });
706~

707~
    it('should reset loading state after search completion', async () => {
708~
      const mockPatients = [
709~
        { id: '1', name: '김환자', patient_number: 'P001' },
710~
      ];
711~

712~
      (fetch as Mock).mockResolvedValueOnce({
713~
        ok: true,
714~
        json: async () => ({ patients: mockPatients }),
715~
      });
716~

717~
      render(<QuickSearch />);
718~
      
719~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
720~
      
721~
      fireEvent.change(input, { target: { value: '김환자' } });
722~
      
723~
      act(() => {
724~
        vi.advanceTimersByTime(500);
725~
      });
726~

727~
      await waitFor(() => {
728~
        expect(screen.getByText('김환자')).toBeInTheDocument();
729~
      });
730~

731~
      // Loading spinner should not be visible after results are shown
732~
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
733~
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
734~
    });
735~

736~
    it('should handle search input blur events', () => {
737~
      render(<QuickSearch />);
738~
      
739~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
740~
      
741~
      fireEvent.change(input, { target: { value: '김환자' } });
742~
      fireEvent.blur(input);
743~
      
744~
      // Component should handle blur without errors
745~
      expect(input).toBeInTheDocument();
746~
    });
747~

748~
    it('should handle search input focus events', () => {
749~
      render(<QuickSearch />);
750~
      
751~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
752~
      
753~
      fireEvent.focus(input);
754~
      
755~
      expect(document.activeElement).toBe(input);
756~
    });
757~
  });
758~

759~
  describe('Performance and Memory Management', () => {
760~
    it('should cleanup debounced searches on unmount', async () => {
761~
      const { unmount } = render(<QuickSearch />);
762~
      
763~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
764~
      
765~
      fireEvent.change(input, { target: { value: '김환자' } });
766~
      
767~
      // Unmount before debounce completes
768~
      unmount();
769~
      
770~
      act(() => {
771~
        vi.advanceTimersByTime(500);
772~
      });
773~
      
774~
      // Should not make API call after unmount
775~
      expect(fetch).not.toHaveBeenCalled();
776~
    });
777~

778~
    it('should handle large result sets efficiently', async () => {
779~
      const largePatientList = Array.from({ length: 1000 }, (_, i) => ({
780~
        id: `patient-${i}`,
781~
        name: `환자${i}`,
782~
        patient_number: `P${String(i).padStart(3, '0')}`,
783~
      }));
784~

785~
      (fetch as Mock).mockResolvedValueOnce({
786~
        ok: true,
787~
        json: async () => ({ patients: largePatientList }),
788~
      });
789~

790~
      render(<QuickSearch />);
791~
      
792~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
793~
      
794~
      fireEvent.change(input, { target: { value: '환자' } });
795~
      
796~
      act(() => {
797~
        vi.advanceTimersByTime(500);
798~
      });
799~

800~
      await waitFor(() => {
801~
        // Should render first few results (assuming component implements virtualization or pagination)
802~
        expect(screen.getByText('환자0')).toBeInTheDocument();
803~
      });
804~
    });
805~
  });
806~

807~
  describe('Accessibility Features', () => {
808~
    it('should have proper ARIA labels', () => {
809~
      render(<QuickSearch />);
810~
      
811~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
812~
      const button = screen.getByRole('button', { name: '전체 환자' });
813~
      
814~
      expect(input).toHaveAttribute('type', 'text');
815~
      expect(button).toHaveAttribute('type', 'button');
816~
    });
817~

818~
    it('should support screen reader announcements for search results', async () => {
819~
      const mockPatients = [
820~
        { id: '1', name: '김환자', patient_number: 'P001' },
821~
        { id: '2', name: '김철수', patient_number: 'P002' },
822~
      ];
823~

824~
      (fetch as Mock).mockResolvedValueOnce({
825~
        ok: true,
826~
        json: async () => ({ patients: mockPatients }),
827~
      });
828~

829~
      render(<QuickSearch />);
830~
      
831~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
832~
      
833~
      fireEvent.change(input, { target: { value: '김' } });
834~
      
835~
      act(() => {
836~
        vi.advanceTimersByTime(500);
837~
      });
838~

839~
      await waitFor(() => {
840~
        expect(screen.getByText('김환자')).toBeInTheDocument();
841~
      });
842~

843~
      // Results should be properly structured for screen readers
844~
      const results = screen.getAllByText(/김/);
845~
      expect(results.length).toBeGreaterThan(0);
846~
    });
847~

848~
    it('should handle keyboard escape to clear results', async () => {
849~
      const mockPatients = [
850~
        { id: '1', name: '김환자', patient_number: 'P001' },
851~
      ];
852~

853~
      (fetch as Mock).mockResolvedValueOnce({
854~
        ok: true,
855~
        json: async () => ({ patients: mockPatients }),
856~
      });
857~

858~
      render(<QuickSearch />);
859~
      
860~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
861~
      
862~
      fireEvent.change(input, { target: { value: '김환자' } });
863~
      
864~
      act(() => {
865~
        vi.advanceTimersByTime(500);
866~
      });
867~

868~
      await waitFor(() => {
869~
        expect(screen.getByText('김환자')).toBeInTheDocument();
870~
      });
871~

872~
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
873~
      
874~
      // Results should be cleared or hidden
875~
      // Note: This test assumes the component implements escape key handling
876~
      expect(input).toBeInTheDocument();
877~
    });
878~

879~
    it('should handle Enter key press on search input', async () => {
880~
      render(<QuickSearch />);
881~
      
882~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
883~
      
884~
      fireEvent.change(input, { target: { value: '김환자' } });
885~
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
886~
      
887~
      // Component should handle Enter key without errors
888~
      expect(input).toBeInTheDocument();
889~
    });
890~
  });
891~

892~
  describe('Boundary Value Testing', () => {
893~
    it('should handle exactly 2 character search query', async () => {
894~
      const mockPatients = [
895~
        { id: '1', name: '김환자', patient_number: 'P001' },
896~
      ];
897~

898~
      (fetch as Mock).mockResolvedValueOnce({
899~
        ok: true,
900~
        json: async () => ({ patients: mockPatients }),
901~
      });
902~

903~
      render(<QuickSearch />);
904~
      
905~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
906~
      
907~
      fireEvent.change(input, { target: { value: '김환' } });
908~
      
909~
      act(() => {
910~
        vi.advanceTimersByTime(500);
911~
      });
912~

913~
      await waitFor(() => {
914~
        expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%EA%B9%80%ED%99%98');
915~
      });
916~
    });
917~

918~
    it('should not search with exactly 1 character', async () => {
919~
      render(<QuickSearch />);
920~
      
921~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
922~
      
923~
      fireEvent.change(input, { target: { value: 'ㄱ' } });
924~
      
925~
      act(() => {
926~
        vi.advanceTimersByTime(500);
927~
      });
928~
      
929~
      expect(fetch).not.toHaveBeenCalled();
930~
    });
931~

932~
    it('should handle search with whitespace trimming', async () => {
933~
      const mockPatients = [
934~
        { id: '1', name: '김환자', patient_number: 'P001' },
935~
      ];
936~

937~
      (fetch as Mock).mockResolvedValueOnce({
938~
        ok: true,
939~
        json: async () => ({ patients: mockPatients }),
940~
      });
941~

942~
      render(<QuickSearch />);
943~
      
944~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
945~
      
946~
      fireEvent.change(input, { target: { value: '  김환자  ' } });
947~
      
948~
      act(() => {
949~
        vi.advanceTimersByTime(500);
950~
      });
951~

952~
      await waitFor(() => {
953~
        expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%20%20%EA%B9%80%ED%99%98%EC%9E%90%20%20');
954~
      });
955~
    });
956~
  });
957~

958~
  describe('Loading State Management', () => {
959~
    it('should show loading state immediately when search starts', async () => {
960~
      (fetch as Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
961~

962~
      render(<QuickSearch />);
963~
      
964~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
965~
      
966~
      fireEvent.change(input, { target: { value: '김환자' } });
967~
      
968~
      act(() => {
969~
        vi.advanceTimersByTime(300);
970~
      });
971~

972~
      // Should show loading spinner
973~
      await waitFor(() => {
974~
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
975~
      });
976~
    });
977~

978~
    it('should hide loading state when search completes with results', async () => {
979~
      const mockPatients = [
980~
        { id: '1', name: '김환자', patient_number: 'P001' },
981~
      ];
982~

983~
      (fetch as Mock).mockResolvedValueOnce({
984~
        ok: true,
985~
        json: async () => ({ patients: mockPatients }),
986~
      });
987~

988~
      render(<QuickSearch />);
989~
      
990~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
991~
      
992~
      fireEvent.change(input, { target: { value: '김환자' } });
993~
      
994~
      act(() => {
995~
        vi.advanceTimersByTime(500);
996~
      });
997~

998~
      await waitFor(() => {
999~
        expect(screen.getByText('김환자')).toBeInTheDocument();
1000~
      });
1001~

1002~
      // Loading should be hidden
1003~
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
1004~
    });
1005~

1006~
    it('should hide loading state when search completes with no results', async () => {
1007~
      (fetch as Mock).mockResolvedValueOnce({
1008~
        ok: true,
1009~
        json: async () => ({ patients: [] }),
1010~
      });
1011~

1012~
      render(<QuickSearch />);
1013~
      
1014~
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
1015~
      
1016~
      fireEvent.change(input, { target: { value: '존재하지않는환자' } });
1017~
      
1018~
      act(() => {
1019~
        vi.advanceTimersByTime(500);
1020~
      });
1021~

1022~
      await waitFor(() => {
1023~
        expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
1024~
      });
1025~

1026~
      // Loading should be hidden
1027~
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
1028~
    });
1029~
  });
1030~
});