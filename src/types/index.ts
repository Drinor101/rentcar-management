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
  clientEmail: string;
  startDate: string; // Date only (YYYY-MM-DD)
  pickUpTime?: string; // Time in HH:mm format (e.g., "09:00")
  endDate: string; // Date only (YYYY-MM-DD)
  returnTime?: string; // Time in HH:mm format (e.g., "14:00")
  totalAmount: number;
  discount?: number; // Discount amount in EUR (fixed amount deducted from daily rate)
  isPaid?: boolean; // Whether the booking is paid
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other'; // Payment method
  dailyRateAtBooking?: number; // Daily rate of the car at the time of booking creation
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
  clientEmail: string;
  startDate: string;
  pickUpTime?: string;
  endDate: string;
  returnTime?: string;
  days: number;
  dailyRate: number;
  totalAmount: number;
  discount?: number; // Discount amount in EUR (fixed amount deducted from daily rate)
  isPaid?: boolean; // Whether the booking is paid
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other'; // Payment method
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

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}