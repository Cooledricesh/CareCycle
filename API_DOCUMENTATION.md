# CareCycle Patient Detail APIs

환자 상세 페이지를 위한 API 엔드포인트들입니다.

## 1. 환자 상세 정보 조회

### GET `/api/patients/[id]`

환자의 상세 정보와 활성 일정을 조회합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Response:**
```json
{
  "id": "uuid",
  "patient_number": "P001",
  "name": "환자명",
  "phone": "010-1234-5678",
  "notes": "환자 노트",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "patient_schedules": [
    {
      "id": "schedule-uuid",
      "item_id": "item-uuid",
      "first_implementation_date": "2024-01-01",
      "next_due_date": "2024-02-01",
      "last_implementation_date": "2024-01-01",
      "is_active": true,
      "items": {
        "id": "item-uuid",
        "name": "혈액검사",
        "category": "test",
        "cycle_value": 4,
        "cycle_unit": "weeks"
      }
    }
  ]
}
```

## 2. 환자 정보 수정

### PUT `/api/patients/[id]`

환자의 기본 정보를 수정합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Request Body:**
```json
{
  "patient_number": "P002",  // optional
  "name": "수정된 환자명",      // optional
  "phone": "010-9876-5432",  // optional
  "notes": "수정된 노트"       // optional
}
```

**Response:** 수정된 환자 정보

## 3. 환자 삭제 (Soft Delete)

### DELETE `/api/patients/[id]`

환자의 모든 일정을 비활성화합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Response:**
```json
{
  "message": "환자가 성공적으로 삭제되었습니다",
  "patient_id": "uuid"
}
```

## 4. 환자 일정 조회

### GET `/api/patients/[id]/schedules`

환자의 모든 일정을 조회합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Query Parameters:**
- `active_only` (boolean): true시 활성 일정만 조회
- `include_history` (boolean): true시 일정 히스토리 포함

**Response:**
```json
{
  "patient": {
    "id": "uuid",
    "name": "환자명",
    "patient_number": "P001"
  },
  "schedules": [...],
  "summary": {
    "total": 5,
    "active": 3,
    "inactive": 2,
    "overdue": 1,
    "upcoming": 2
  }
}
```

## 5. 환자 일정 추가

### POST `/api/patients/[id]/schedules`

환자에게 새로운 일정을 추가합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Request Body:**
```json
{
  "item_id": "item-uuid",
  "first_implementation_date": "2024-01-01"
}
```

**Response:** 생성된 일정 정보

## 6. 환자 일정 수정

### PUT `/api/patients/[id]/schedules`

환자의 일정을 수정합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Request Body:**
```json
{
  "schedule_id": "schedule-uuid",
  "first_implementation_date": "2024-01-15",  // optional
  "is_active": false  // optional
}
```

## 7. 개별 일정 상세 조회

### GET `/api/patients/[id]/schedules/[scheduleId]`

특정 일정의 상세 정보와 히스토리를 조회합니다.

**Parameters:**
- `id` (string, required): 환자 UUID
- `scheduleId` (string, required): 일정 UUID

**Response:** 일정 상세 정보 + 히스토리

## 8. 개별 일정 수정

### PUT `/api/patients/[id]/schedules/[scheduleId]`

특정 일정을 수정합니다.

**Parameters:**
- `id` (string, required): 환자 UUID
- `scheduleId` (string, required): 일정 UUID

**Request Body:**
```json
{
  "first_implementation_date": "2024-01-15",  // optional
  "next_due_date": "2024-02-15",              // optional
  "last_implementation_date": "2024-01-10",   // optional
  "is_active": false                          // optional
}
```

## 9. 개별 일정 삭제

### DELETE `/api/patients/[id]/schedules/[scheduleId]`

특정 일정을 비활성화합니다.

**Parameters:**
- `id` (string, required): 환자 UUID
- `scheduleId` (string, required): 일정 UUID

## 10. 일정 완료 처리

### POST `/api/patients/[id]/schedules/[scheduleId]/complete`

일정을 완료로 처리하고 다음 일정을 생성합니다.

**Parameters:**
- `id` (string, required): 환자 UUID
- `scheduleId` (string, required): 일정 UUID

**Request Body:**
```json
{
  "actual_implementation_date": "2024-01-05",
  "notes": "완료 노트",  // optional
  "scheduled_date": "2024-01-01"  // optional, 기본값은 next_due_date
}
```

**Response:**
```json
{
  "message": "일정이 성공적으로 완료되었습니다",
  "schedule": {...},
  "history_entry": {...},
  "next_due_date": "2024-02-05"
}
```

## 11. 일정 완료 기록 조회

### GET `/api/patients/[id]/schedules/[scheduleId]/complete`

특정 일정의 완료 기록을 조회합니다.

**Query Parameters:**
- `completed_only` (boolean): 완료된 기록만 조회
- `limit` (number): 조회할 기록 수
- `offset` (number): 건너뛸 기록 수

**Response:**
```json
{
  "history": [...],
  "statistics": {
    "total": 10,
    "completed": 8,
    "pending": 2,
    "completion_rate": 80.0
  }
}
```

## 12. 환자 전체 히스토리 조회

### GET `/api/patients/[id]/history`

환자의 전체 일정 히스토리를 조회합니다.

**Parameters:**
- `id` (string, required): 환자 UUID

**Query Parameters:**
- `completed_only` (boolean): 완료된 기록만 조회
- `item_id` (string): 특정 항목의 기록만 조회
- `start_date` (string): 시작 날짜 (YYYY-MM-DD)
- `end_date` (string): 종료 날짜 (YYYY-MM-DD)
- `limit` (number): 조회할 기록 수 (기본값: 50)
- `offset` (number): 건너뛸 기록 수 (기본값: 0)
- `group_by` (string): 그룹핑 방식 ('item', 'month', 'year')

**Response:**
```json
{
  "patient": {...},
  "history": [...],
  "statistics": {
    "total": 100,
    "completed": 85,
    "pending": 15,
    "completion_rate": 85.0
  },
  "grouped_data": [...],  // group_by 파라미터가 있을 때만
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

## 에러 코드

- `400` - 잘못된 요청 (유효하지 않은 UUID, 필수 필드 누락 등)
- `404` - 리소스를 찾을 수 없음
- `409` - 충돌 (중복된 환자 번호, 이미 완료된 일정 등)
- `500` - 서버 내부 오류

## 사용 예시

```typescript
// 환자 상세 정보 조회
const response = await fetch(`/api/patients/${patientId}`);
const patient = await response.json();

// 환자 정보 수정
await fetch(`/api/patients/${patientId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '수정된 이름',
    phone: '010-9876-5432'
  })
});

// 일정 완료 처리
await fetch(`/api/patients/${patientId}/schedules/${scheduleId}/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actual_implementation_date: '2024-01-05',
    notes: '정상 완료'
  })
});
```