import { supabase } from '../lib/supabase';
import type { Car } from '../types';
import type { Database } from '../types/supabase';

type CarRow = Database['public']['Tables']['cars']['Row'];
type CarInsert = Database['public']['Tables']['cars']['Insert'];
type CarUpdate = Database['public']['Tables']['cars']['Update'];

// Convert Supabase car to app Car type
const mapCarFromDB = (car: CarRow): Car => ({
  id: car.id,
  make: car.make,
  model: car.model,
  year: car.year,
  color: car.color,
  licensePlate: car.license_plate,
  dailyRate: Number(car.daily_rate),
  image: car.image,
  status: car.status,
});

// Convert app Car type to Supabase insert type
const mapCarToDB = (car: Omit<Car, 'id'>): CarInsert => ({
  make: car.make,
  model: car.model,
  year: car.year,
  color: car.color,
  license_plate: car.licensePlate,
  daily_rate: car.dailyRate,
  image: car.image,
  status: car.status,
});

export const carsService = {
  // Get all cars
  async getAll(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapCarFromDB);
  },

  // Get car by ID
  async getById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapCarFromDB(data) : null;
  },

  // Create new car
  async create(car: Omit<Car, 'id'>): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .insert(mapCarToDB(car))
      .select()
      .single();

    if (error) throw error;
    return mapCarFromDB(data);
  },

  // Update car
  async update(id: string, car: Partial<Omit<Car, 'id'>>): Promise<Car> {
    const updateData: CarUpdate = {};
    
    if (car.make !== undefined) updateData.make = car.make;
    if (car.model !== undefined) updateData.model = car.model;
    if (car.year !== undefined) updateData.year = car.year;
    if (car.color !== undefined) updateData.color = car.color;
    if (car.licensePlate !== undefined) updateData.license_plate = car.licensePlate;
    if (car.dailyRate !== undefined) updateData.daily_rate = car.dailyRate;
    if (car.image !== undefined) updateData.image = car.image;
    if (car.status !== undefined) updateData.status = car.status;

    const { data, error } = await supabase
      .from('cars')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapCarFromDB(data);
  },

  // Delete car
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(callback: (car: Car) => void) {
    return supabase
      .channel('cars_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cars',
        },
        (payload) => {
          if (payload.new) {
            callback(mapCarFromDB(payload.new as CarRow));
          }
        }
      )
      .subscribe();
  },
};

