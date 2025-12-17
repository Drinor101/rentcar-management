import React, { useState } from 'react';
import { Calendar, User, Phone, Car, Clock, Euro, Plus, Edit, Trash2, UserCircle, Mail } from 'lucide-react';
import { Booking, Car as CarType } from '../types';
import BookingModal from './BookingModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { calculateRentalDays } from '../utils/dateCalculations';

interface BookingsManagementProps {
  bookings: Booking[]; // Filtered bookings for list view
  allBookings: Booking[]; // All bookings for conflict checking
  cars: CarType[];
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  onUpdateBooking: (id: string, booking: Omit<Booking, 'id'>) => void;
  onDeleteBooking: (id: string) => void;
}

const BookingsManagement: React.FC<BookingsManagementProps> = ({ 
  bookings,
  allBookings,
  cars, 
  onAddBooking, 
  onUpdateBooking,
  onDeleteBooking
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; booking: Booking | null }>({
    isOpen: false,
    booking: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
      case 'active': return 'AKTIV';
      case 'completed': return 'PËRFUNDUAR';
      case 'cancelled': return 'ANULUAR';
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
            <option value="active">AKTIVE</option>
            <option value="completed">TË PËRFUNDUARA</option>
            <option value="cancelled">TË ANULUARA</option>
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
                    {booking.clientEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{booking.clientEmail}</span>
                      </div>
                    )}
                    {booking.createdByName && (
                      <div className="flex items-center gap-2">
                        <UserCircle size={16} />
                        <span className="text-gray-500">Krijuar nga: <span className="font-medium text-gray-700">{booking.createdByName}</span></span>
                      </div>
                    )}
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
                      <span>
                        Nga: {new Date(booking.startDate).toLocaleDateString('sq-AL')}
                        {booking.pickUpTime && <span className="ml-1 font-medium">({booking.pickUpTime.split(':').slice(0, 2).join(':')})</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        Deri: {new Date(booking.endDate).toLocaleDateString('sq-AL')}
                        {booking.returnTime && <span className="ml-1 font-medium">({booking.returnTime.split(':').slice(0, 2).join(':')})</span>}
                      </span>
                    </div>
                    {booking.discount !== undefined && booking.discount !== null && Number(booking.discount) > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 font-medium">Zbritje: {booking.discount}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${booking.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {booking.isPaid ? '✓ E paguar' : '✗ E papaguar'}
                      </span>
                      {booking.isPaid && booking.paymentMethod && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({booking.paymentMethod === 'cash' ? 'Cash' : 
                            booking.paymentMethod === 'card' ? 'Kartë' : 
                            booking.paymentMethod === 'bank_transfer' ? 'Transfer Bankar' : 
                            booking.paymentMethod === 'cheque' ? 'Çek' : 
                            'Tjetër'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Euro size={20} className="text-gray-400" />
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {Number(booking.totalAmount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Totali</p>
                      </div>
                    </div>
                    
                    {/* Daily Rate & Days */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Çmimi Ditor:</span>
                        <span className="font-semibold text-gray-800">€{booking.dailyRateAtBooking || car?.dailyRate || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Ditët:</span>
                        <span className="font-semibold text-gray-800">
                          {calculateRentalDays(
                            booking.startDate,
                            booking.pickUpTime,
                            booking.endDate,
                            booking.returnTime
                          )} ditë
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleEditBooking(booking)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Ndrysho
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ isOpen: true, booking: booking })}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Fshi Rezervimin
                    </button>
                  </div>
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
          bookings={allBookings}
          onSave={handleSaveBooking}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Fshi Rezervimin"
        message="A jeni të sigurt që dëshironi të fshini këtë rezervim?"
        itemName={deleteModal.booking ? `${deleteModal.booking.clientName} - ${new Date(deleteModal.booking.startDate).toLocaleDateString('sq-AL')}` : undefined}
        onConfirm={async () => {
          if (deleteModal.booking) {
            setIsDeleting(true);
            try {
              await onDeleteBooking(deleteModal.booking.id);
              setDeleteModal({ isOpen: false, booking: null });
            } catch (error) {
              console.error('Error deleting booking:', error);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        onCancel={() => setDeleteModal({ isOpen: false, booking: null })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BookingsManagement;