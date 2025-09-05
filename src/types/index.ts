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
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  date: string;
  read: boolean;
}