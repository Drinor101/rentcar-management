export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          color: string
          license_plate: string
          daily_rate: number
          image: string
          status: 'available' | 'rented' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          color: string
          license_plate: string
          daily_rate: number
          image: string
          status: 'available' | 'rented' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          color?: string
          license_plate?: string
          daily_rate?: number
          image?: string
          status?: 'available' | 'rented' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          car_id: string
          client_name: string
          client_phone: string
          start_date: string
          end_date: string
          total_amount: number
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          car_id: string
          client_name: string
          client_phone: string
          start_date: string
          end_date: string
          total_amount: number
          status: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          client_name?: string
          client_phone?: string
          start_date?: string
          end_date?: string
          total_amount?: number
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      reports: {
        Row: {
          id: string
          car_id: string
          car_make: string
          car_model: string
          client_name: string
          client_phone: string
          start_date: string
          end_date: string
          days: number
          daily_rate: number
          total_amount: number
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
      }
    }
  }
}

