import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

// Convert Supabase booking to app Booking type
const mapBookingFromDB = (booking: any): Booking => ({
  id: booking.id,
  carId: booking.car_id,
  clientName: booking.client_name,
  clientPhone: booking.client_phone,
  startDate: booking.start_date,
  endDate: booking.end_date,
  totalAmount: Number(booking.total_amount),
  status: booking.status,
  createdBy: booking.created_by || undefined,
});

// Convert app Booking type to Supabase insert type
const mapBookingToDB = (booking: Omit<Booking, 'id'>): any => ({
  car_id: booking.carId,
  client_name: booking.clientName,
  client_phone: booking.clientPhone,
  start_date: booking.startDate,
  end_date: booking.endDate,
  total_amount: booking.totalAmount,
  status: booking.status,
  created_by: booking.createdBy || undefined,
});

export const bookingsService = {
  // Get all bookings
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapBookingFromDB);
  },

  // Get bookings by user ID
  async getByUserId(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapBookingFromDB);
  },

  // Get booking by ID
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapBookingFromDB(data) : null;
  },

  // Create new booking
  async create(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const bookingData = mapBookingToDB(booking);
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData as any)
      .select()
      .single();

    if (error) throw error;
    return mapBookingFromDB(data);
  },

  // Update booking
  async update(id: string, booking: Partial<Omit<Booking, 'id'>>): Promise<Booking> {
    const updateData: any = {};
    
    if (booking.carId !== undefined) updateData.car_id = booking.carId;
    if (booking.clientName !== undefined) updateData.client_name = booking.clientName;
    if (booking.clientPhone !== undefined) updateData.client_phone = booking.clientPhone;
    if (booking.startDate !== undefined) updateData.start_date = booking.startDate;
    if (booking.endDate !== undefined) updateData.end_date = booking.endDate;
    if (booking.totalAmount !== undefined) updateData.total_amount = booking.totalAmount;
    if (booking.status !== undefined) updateData.status = booking.status;

    const { data, error } = await (supabase
      .from('bookings') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBookingFromDB(data);
  },

  // Delete booking
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(callback: (booking: Booking) => void) {
    return supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          if (payload.new) {
            callback(mapBookingFromDB(payload.new as any));
          }
        }
      )
      .subscribe();
  },
};

