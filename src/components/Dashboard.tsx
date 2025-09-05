import React from 'react';
import { Car, Calendar, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Car as CarType, Booking } from '../types';

interface DashboardProps {
  cars: CarType[];
  bookings: Booking[];
  notifications: number;
}

const Dashboard: React.FC<DashboardProps> = ({ cars, bookings, notifications }) => {
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
      title: 'Rezervime Aktive', 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rezervime të Fundit</h3>
          <div className="space-y-4">
            {recentBookings.map((booking) => {
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
                      {booking.status === 'active' ? 'Aktiv' : 
                       booking.status === 'completed' ? 'Përfunduar' : 'Anuluar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Veprime të Shpejta</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium transition-colors">
                Shto Makinë të Re
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium transition-colors">
                Rezervim i Ri
              </button>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-3 rounded-lg text-sm font-medium transition-colors">
                Shiko Raportet
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium transition-colors">
                Menaxho Klientët
              </button>
            </div>
          </div>

          {notifications > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-yellow-800 font-medium">Njoftime të Reja</h4>
                  <p className="text-yellow-700 text-sm">Ju keni {notifications} njoftime që kërkojnë vëmendje.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;