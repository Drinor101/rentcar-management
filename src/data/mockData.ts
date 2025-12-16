import { Car, Booking, Report } from '../types';

export const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'E Bardhë',
    licensePlate: 'TR 123 AB',
    dailyRate: 35,
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=500',
    status: 'available'
  },
  {
    id: '2',
    make: 'BMW',
    model: 'X5',
    year: 2022,
    color: 'E Zezë',
    licensePlate: 'TR 456 CD',
    dailyRate: 80,
    image: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=500',
    status: 'rented'
  },
  {
    id: '3',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    color: 'E Kuqe',
    licensePlate: 'TR 789 EF',
    dailyRate: 40,
    image: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=500',
    status: 'available'
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    carId: '2',
    clientName: 'Ardit Hoxha',
    clientPhone: '+355 69 123 4567',
    startDate: '2024-12-01',
    endDate: '2024-12-28',
    totalAmount: 2160,
    status: 'active'
  },
  {
    id: '2',
    carId: '1',
    clientName: 'Elira Berisha',
    clientPhone: '+355 68 987 6543',
    startDate: '2024-11-15',
    endDate: '2024-12-20',
    totalAmount: 1225,
    status: 'completed'
  }
];

// Dummy report data - will be replaced with Supabase data later
export const mockReports: Report[] = [
  {
    id: '1',
    carId: '2',
    carMake: 'BMW',
    carModel: 'X5',
    clientName: 'Ardit Hoxha',
    clientPhone: '+355 69 123 4567',
    startDate: '2024-12-01',
    endDate: '2024-12-28',
    days: 27,
    dailyRate: 80,
    totalAmount: 2160,
    status: 'active',
    createdAt: '2024-11-25T10:00:00Z'
  },
  {
    id: '2',
    carId: '1',
    carMake: 'Toyota',
    carModel: 'Corolla',
    clientName: 'Elira Berisha',
    clientPhone: '+355 68 987 6543',
    startDate: '2024-11-15',
    endDate: '2024-12-20',
    days: 35,
    dailyRate: 35,
    totalAmount: 1225,
    status: 'completed',
    createdAt: '2024-11-10T14:30:00Z'
  },
  {
    id: '3',
    carId: '3',
    carMake: 'Volkswagen',
    carModel: 'Golf',
    clientName: 'Besnik Krasniqi',
    clientPhone: '+355 67 111 2222',
    startDate: '2024-10-01',
    endDate: '2024-10-15',
    days: 14,
    dailyRate: 40,
    totalAmount: 560,
    status: 'completed',
    createdAt: '2024-09-25T09:15:00Z'
  },
  {
    id: '4',
    carId: '1',
    carMake: 'Toyota',
    carModel: 'Corolla',
    clientName: 'Driton Shala',
    clientPhone: '+355 69 333 4444',
    startDate: '2024-11-01',
    endDate: '2024-11-10',
    days: 9,
    dailyRate: 35,
    totalAmount: 315,
    status: 'completed',
    createdAt: '2024-10-28T11:20:00Z'
  },
  {
    id: '5',
    carId: '2',
    carMake: 'BMW',
    carModel: 'X5',
    clientName: 'Arta Gashi',
    clientPhone: '+355 68 555 6666',
    startDate: '2024-09-10',
    endDate: '2024-09-25',
    days: 15,
    dailyRate: 80,
    totalAmount: 1200,
    status: 'completed',
    createdAt: '2024-09-05T16:45:00Z'
  },
  {
    id: '6',
    carId: '3',
    carMake: 'Volkswagen',
    carModel: 'Golf',
    clientName: 'Flamur Morina',
    clientPhone: '+355 67 777 8888',
    startDate: '2024-12-10',
    endDate: '2024-12-18',
    days: 8,
    dailyRate: 40,
    totalAmount: 320,
    status: 'active',
    createdAt: '2024-12-05T13:00:00Z'
  }
];