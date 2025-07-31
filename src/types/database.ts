export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          category: 'test' | 'injection';
          cycle_value: number;
          cycle_unit: 'weeks' | 'months';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['items']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          patient_number: string;
          name: string;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      patient_schedules: {
        Row: {
          id: string;
          patient_id: string;
          item_id: string;
          first_implementation_date: string;
          next_due_date: string;
          last_implementation_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patient_schedules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patient_schedules']['Insert']>;
      };
      schedule_history: {
        Row: {
          id: string;
          patient_schedule_id: string;
          scheduled_date: string;
          actual_implementation_date: string | null;
          is_completed: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['schedule_history']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['schedule_history']['Insert']>;
      };
    };
  };
}