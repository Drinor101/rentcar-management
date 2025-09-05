import { Car, Booking, Notification } from '../types';

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

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    message: 'BMW X5 (TR 456 CD) - Rezervimi përfundon më 28 Dhjetor 2024',
    date: '2024-12-15',
    read: false
  },
  {
    id: '2',
    type: 'info',
    message: 'Rezervim i ri nga Elira Berisha për Toyota Corolla',
    date: '2024-12-14',
    read: true
  },
  {
    id: '3',
    type: 'warning',
    message: 'Volkswagen Golf ka nevojë për mirëmbajtje',
    date: '2024-12-13',
    read: false
  }
];