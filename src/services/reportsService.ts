import { supabase } from '../lib/supabase';
import type { Report } from '../types';
import type { Database } from '../types/supabase';

type ReportRow = Database['public']['Views']['reports']['Row'];

// Convert Supabase report to app Report type
const mapReportFromDB = (report: ReportRow): Report => ({
  id: report.id,
  carId: report.car_id,
  carMake: report.car_make,
  carModel: report.car_model,
  clientName: report.client_name,
  clientPhone: report.client_phone,
  clientEmail: (report as any).client_email || '',
  startDate: report.start_date,
  pickUpTime: (report as any).pick_up_time || undefined,
  endDate: report.end_date,
  returnTime: (report as any).return_time || undefined,
  days: report.days,
  dailyRate: Number(report.daily_rate),
  totalAmount: Number(report.total_amount),
  discount: (report as any).discount !== null && (report as any).discount !== undefined ? Number((report as any).discount) : undefined,
  isPaid: (report as any).is_paid !== null && (report as any).is_paid !== undefined ? Boolean((report as any).is_paid) : false,
  paymentMethod: (report as any).payment_method || undefined,
  status: report.status,
  createdAt: report.created_at,
  createdBy: (report as any).created_by || undefined,
  createdByName: (report as any).created_by_name || undefined,
});

export const reportsService = {
  // Get all reports
  async getAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },

  // Get reports by user ID
  async getByUserId(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },

  // Get reports filtered by date
  async getByDate(date: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('start_date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },

  // Get reports filtered by month and year
  async getByMonth(month: number, year: number): Promise<Report[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },

  // Get reports filtered by year
  async getByYear(year: number): Promise<Report[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },

  // Get reports filtered by status
  async getByStatus(status: 'active' | 'completed' | 'cancelled'): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportFromDB);
  },
};

