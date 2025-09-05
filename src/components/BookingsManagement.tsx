import React, { useState } from 'react';
import { Calendar, User, Phone, Car, Clock, Euro, Plus, Edit } from 'lucide-react';
import { Booking, Car as CarType } from '../types';
import BookingModal from './BookingModal';

interface BookingsManagementProps {
  bookings: Booking[];
  cars: CarType[];
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  onUpdateBooking: (id: string, booking: Omit<Booking, 'id'>) => void;
}

const BookingsManagement: React.FC<BookingsManagementProps> = ({ 
  bookings, 
  cars, 
  onAddBooking, 
  onUpdateBooking 
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings
    .filter(booking => statusFilter === 'all' || booking.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'endDate') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
      return a.clientName.localeCompare(b.clientName);
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Përfunduar';
      case 'cancelled': return 'Anuluar';
      default: return status;
    }
  };

  const isEndingSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const handleAddBooking = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleSaveBooking = (bookingData: Omit<Booking, 'id'>) => {
    if (editingBooking) {
      onUpdateBooking(editingBooking.id, bookingData);
    } else {
      onAddBooking(bookingData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Të Gjitha Rezervimet</option>
            <option value="active">Aktive</option>
            <option value="completed">Të Përfunduara</option>
            <option value="cancelled">Të Anuluara</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="endDate">Data e Përfundimit</option>
            <option value="startDate">Data e Fillimit</option>
            <option value="amount">Shuma</option>
            <option value="client">Klient</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total: {filteredBookings.length} rezervime
        </div>
        
        <button
          onClick={handleAddBooking}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Rezervim i Ri
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const car = cars.find(c => c.id === booking.carId);
          const endingSoon = isEndingSoon(booking.endDate);
          
          return (
            <div key={booking.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
              endingSoon && booking.status === 'active' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
            }`}>
              {endingSoon && booking.status === 'active' && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4 flex items-center">
                  <Clock size={16} className="text-orange-600 mr-2" />
                  <span className="text-orange-800 text-sm font-medium">
                    Kujdes! Kjo rezervim përfundon së shpejti ({booking.endDate})
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.clientName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{booking.clientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Car & Dates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Car size={20} className="text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-800">{car?.make} {car?.model}</h4>
                      <p className="text-sm text-gray-600">Targë: {car?.licensePlate}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Nga: {new Date(booking.startDate).toLocaleDateString('sq-AL')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Deri: {new Date(booking.endDate).toLocaleDateString('sq-AL')}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Euro size={20} className="text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">€{booking.totalAmount}</p>
                      <p className="text-sm text-gray-600">Totali</p>
                    </div>
                  </div>
                  
                  {booking.status === 'active' && (
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleEditBooking(booking)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Ndrysho
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Përfundo Rezervimin
                      </button>
                      <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm transition-colors">
                        Zgjat Rezervimin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk u gjetën rezervime</h3>
          <p className="text-gray-500">Nuk ka rezervime që përputhen me kriteret e kërkimit.</p>
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal
          booking={editingBooking}
          cars={cars}
          onSave={handleSaveBooking}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BookingsManagement;