export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  dailyRate: number;
  image: string;
  status: 'available' | 'rented' | 'maintenance';
}

export interface Booking {
  id: string;
  carId: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  createdBy?: string;
  createdByName?: string;
}

export interface Report {
  id: string;
  carId: string;
  carMake: string;
  carModel: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'puntor';
  password?: string;
}