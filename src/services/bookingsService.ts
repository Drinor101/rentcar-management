import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

// Convert Supabase booking to app Booking type
const mapBookingFromDB = (booking: any): Booking => ({
  id: booking.id,
  carId: booking.car_id,
  clientName: booking.client_name,
  clientPhone: booking.client_phone,
  clientEmail: booking.client_email || '',
  startDate: booking.start_date,
  pickUpTime: booking.pick_up_time || undefined,
  endDate: booking.end_date,
  returnTime: booking.return_time || undefined,
  totalAmount: Number(booking.total_amount),
  discount: booking.discount !== null && booking.discount !== undefined ? Number(booking.discount) : undefined,
  status: booking.status,
  createdBy: booking.created_by || undefined,
  createdByName: booking.created_by_name || booking.users?.username || undefined,
});

// Convert app Booking type to Supabase insert type
const mapBookingToDB = (booking: Omit<Booking, 'id'>): any => ({
  car_id: booking.carId,
  client_name: booking.clientName,
  client_phone: booking.clientPhone,
  client_email: booking.clientEmail || null,
  start_date: booking.startDate,
  pick_up_time: booking.pickUpTime || null,
  end_date: booking.endDate,
  return_time: booking.returnTime || null,
  total_amount: booking.totalAmount,
  discount: booking.discount !== undefined ? booking.discount : 0,
  status: booking.status,
  created_by: booking.createdBy || undefined,
});

export const bookingsService = {
  // Get all bookings
  async getAll(): Promise<Booking[]> {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get unique user IDs
    const userIds = [...new Set(data.map((b: any) => b.created_by).filter(Boolean))];
    
    // Fetch usernames for all users
    const usernamesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: usersData } = await (supabase
        .from('users') as any)
        .select('id, username')
        .in('id', userIds);
      
      if (usersData) {
        usersData.forEach((user: any) => {
          usernamesMap[user.id] = user.username;
        });
      }
    }
    
    // Map the data to include username
    return data.map((booking: any) => {
      const mapped = mapBookingFromDB(booking);
      if (booking.created_by && usernamesMap[booking.created_by]) {
        mapped.createdByName = usernamesMap[booking.created_by];
      }
      return mapped;
    });
  },

  // Get bookings by user ID
  async getByUserId(userId: string): Promise<Booking[]> {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch username for the user
    let username: string | undefined;
    if (userId) {
      const { data: userData } = await (supabase
        .from('users') as any)
        .select('username')
        .eq('id', userId)
        .single();
      
      if (userData) {
        username = userData.username;
      }
    }
    
    // Map the data to include username
    return data.map((booking: any) => {
      const mapped = mapBookingFromDB(booking);
      if (username) {
        mapped.createdByName = username;
      }
      return mapped;
    });
  },

  // Get booking by ID
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    const mapped = mapBookingFromDB(data);
    
    // Fetch username if created_by exists
    if (data.created_by) {
      const { data: userData } = await (supabase
        .from('users') as any)
        .select('username')
        .eq('id', data.created_by)
        .single();
      
      if (userData) {
        mapped.createdByName = userData.username;
      }
    }
    
    return mapped;
  },

  // Create new booking
  async create(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const bookingData = mapBookingToDB(booking);
    const { data, error } = await (supabase
      .from('bookings') as any)
      .insert(bookingData as any)
      .select('*')
      .single();

    if (error) throw error;
    
    const mapped = mapBookingFromDB(data);
    
    // Fetch username if created_by exists
    if (data.created_by) {
      const { data: userData } = await (supabase
        .from('users') as any)
        .select('username')
        .eq('id', data.created_by)
        .single();
      
      if (userData) {
        mapped.createdByName = userData.username;
      }
    }
    
    return mapped;
  },

  // Update booking
  async update(id: string, booking: Partial<Omit<Booking, 'id'>>): Promise<Booking> {
    const updateData: any = {};
    
    if (booking.carId !== undefined) updateData.car_id = booking.carId;
    if (booking.clientName !== undefined) updateData.client_name = booking.clientName;
    if (booking.clientPhone !== undefined) updateData.client_phone = booking.clientPhone;
    if (booking.clientEmail !== undefined) updateData.client_email = booking.clientEmail || null;
    if (booking.startDate !== undefined) updateData.start_date = booking.startDate;
    if (booking.pickUpTime !== undefined) updateData.pick_up_time = booking.pickUpTime || null;
    if (booking.endDate !== undefined) updateData.end_date = booking.endDate;
    if (booking.returnTime !== undefined) updateData.return_time = booking.returnTime || null;
    if (booking.totalAmount !== undefined) updateData.total_amount = booking.totalAmount;
    if (booking.discount !== undefined) updateData.discount = booking.discount || 0;
    if (booking.status !== undefined) updateData.status = booking.status;

    const { data, error } = await (supabase
      .from('bookings') as any)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    const mapped = mapBookingFromDB(data);
    
    // Fetch username if created_by exists
    if (data.created_by) {
      const { data: userData } = await (supabase
        .from('users') as any)
        .select('username')
        .eq('id', data.created_by)
        .single();
      
      if (userData) {
        mapped.createdByName = userData.username;
      }
    }
    
    return mapped;
  },

  // Delete booking
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Auto-complete expired bookings (where end_date has passed)
  async autoCompleteExpired(): Promise<{ updatedCount: number; carIds: string[] }> {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find all active bookings where end_date < today OR (end_date = today AND return_time has passed)
    // First, get all active bookings with end_date <= today
    const { data: activeBookings, error: fetchError } = await (supabase
      .from('bookings') as any)
      .select('id, car_id, end_date, return_time')
      .eq('status', 'active')
      .lte('end_date', today);

    if (fetchError) throw fetchError;

    if (!activeBookings || activeBookings.length === 0) {
      return { updatedCount: 0, carIds: [] };
    }

    // Filter bookings that have actually expired
    // A booking is expired if:
    // 1. end_date < today, OR
    // 2. end_date = today AND (no return_time OR return_time has passed)
    const expiredBookings = activeBookings.filter((b: any) => {
      const endDate = new Date(b.end_date);
      const endDateOnly = endDate.toISOString().split('T')[0];
      
      // If end_date is before today, it's expired
      if (endDateOnly < today) {
        return true;
      }
      
      // If end_date is today, check if return_time has passed
      if (endDateOnly === today && b.return_time) {
        // Parse return_time (format: HH:mm or HH:mm:ss)
        const timeParts = b.return_time.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1] || '0', 10);
        
        // Create return datetime using local timezone
        const returnDateTime = new Date(endDate);
        returnDateTime.setHours(hours, minutes, 0, 0);
        
        // If return time has passed (current time is after return time), booking is expired
        return now.getTime() >= returnDateTime.getTime();
      }
      
      // If end_date is today but no return_time, check if we're past midnight of the next day
      // This means the booking day has ended
      if (endDateOnly === today && !b.return_time) {
        // If end_date is today and no return_time specified, consider it expired
        // if current time is past 00:00 of the next day (meaning the day has ended)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        // If we're past midnight of the next day, the booking day has ended
        return now.getTime() >= tomorrow.getTime();
      }
      
      return false;
    });

    if (expiredBookings.length === 0) {
      return { updatedCount: 0, carIds: [] };
    }

    const bookingIds = expiredBookings.map((b: any) => b.id);
    const carIds = [...new Set(expiredBookings.map((b: any) => b.car_id).filter(Boolean))] as string[];

    // Update all expired bookings to completed status
    const { error: updateError } = await (supabase
      .from('bookings') as any)
      .update({ status: 'completed' })
      .in('id', bookingIds);

    if (updateError) throw updateError;

    // Update car statuses to available
    if (carIds.length > 0) {
      const { error: carUpdateError } = await (supabase
        .from('cars') as any)
        .update({ status: 'available' })
        .in('id', carIds);

      if (carUpdateError) throw carUpdateError;
    }

    return { updatedCount: expiredBookings.length, carIds };
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

