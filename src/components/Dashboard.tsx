import React from 'react';
import { Car, Calendar, TrendingUp, Users } from 'lucide-react';
import { Car as CarType, Booking } from '../types';

interface DashboardProps {
  cars: CarType[];
  bookings: Booking[];
}

const Dashboard: React.FC<DashboardProps> = ({ cars, bookings }) => {
  const availableCars = cars.filter(car => car.status === 'available').length;
  const rentedCars = cars.filter(car => car.status === 'rented').length;
  const activeBookings = bookings.filter(booking => booking.status === 'active').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  const stats = [
    { 
      title: 'Makina të Disponueshme', 
      value: availableCars, 
      icon: Car, 
      color: 'bg-green-500',
      change: '+12%'
    },
    { 
      title: 'Makina të Qira', 
      value: rentedCars, 
      icon: TrendingUp, 
      color: 'bg-blue-500',
      change: '+8%'
    },
    { 
      title: 'Rezervime AKTIVE', 
      value: activeBookings, 
      icon: Calendar, 
      color: 'bg-orange-500',
      change: '+15%'
    },
    { 
      title: 'Të Ardhurat (EUR)', 
      value: `€${totalRevenue.toLocaleString()}`, 
      icon: Users, 
      color: 'bg-purple-500',
      change: '+23%'
    }
  ];

  const recentBookings = bookings.slice(-3);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} nga muaji i kaluar</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings - Centered */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rezervime të Fundit</h3>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => {
                const car = cars.find(c => c.id === booking.carId);
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{booking.clientName}</p>
                      <p className="text-sm text-gray-600">{car?.make} {car?.model}</p>
                      <p className="text-xs text-gray-500">{booking.startDate} - {booking.endDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">€{booking.totalAmount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'active' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'active' ? 'AKTIV' : 
                         booking.status === 'completed' ? 'PËRFUNDUAR' : 'ANULUAR'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">Nuk ka rezervime të fundit</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;