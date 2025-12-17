import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, User, Phone, Car, AlertCircle, Mail, Clock } from 'lucide-react';
import { Booking, Car as CarType } from '../types';
import { calculateRentalDays, checkDateTimeOverlap } from '../utils/dateCalculations';

interface BookingModalProps {
  booking: Booking | null;
  cars: CarType[];
  bookings: Booking[];
  onSave: (booking: Omit<Booking, 'id'>) => void;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ booking, cars, bookings, onSave, onClose }) => {
  const [formData, setFormData] = useState<{
    carId: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    startDate: string;
    pickUpTime: string;
    endDate: string;
    returnTime: string;
    totalAmount: number | string; // Allow string for empty input
    discount: number | string; // Allow string for empty input
    isPaid: boolean;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other' | '';
    status: Booking['status'];
  }>({
    carId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    startDate: '',
    pickUpTime: '',
    endDate: '',
    returnTime: '',
    totalAmount: '',
    discount: '',
    isPaid: false,
    paymentMethod: '',
    status: 'active'
  });

  // Track if user has manually edited totalAmount
  const [isTotalAmountManuallyEdited, setIsTotalAmountManuallyEdited] = useState(false);

  // Check for date/time conflicts with active bookings
  const checkDateConflict = (
    carId: string, 
    startDate: string, 
    pickUpTime: string | undefined,
    endDate: string, 
    returnTime: string | undefined,
    excludeBookingId?: string
  ): Booking[] => {
    if (!carId || !startDate || !endDate) return [];
    
    // Normalize empty strings to undefined
    const normalizedPickUpTime = pickUpTime && pickUpTime.trim() !== '' ? pickUpTime : undefined;
    const normalizedReturnTime = returnTime && returnTime.trim() !== '' ? returnTime : undefined;
    
    return bookings.filter(b => {
      // Skip if this is the booking being edited
      if (excludeBookingId && b.id === excludeBookingId) return false;
      
      // Only check active bookings
      if (b.status !== 'active') return false;
      
      // Check if it's for the same car
      if (b.carId !== carId) return false;
      
      // Normalize booking times (empty strings to undefined)
      const bookingPickUpTime = b.pickUpTime && b.pickUpTime.trim() !== '' ? b.pickUpTime : undefined;
      const bookingReturnTime = b.returnTime && b.returnTime.trim() !== '' ? b.returnTime : undefined;
      
      // Check for datetime overlap using the utility function
      return checkDateTimeOverlap(
        startDate,
        normalizedPickUpTime,
        endDate,
        normalizedReturnTime,
        b.startDate,
        bookingPickUpTime,
        b.endDate,
        bookingReturnTime
      );
    });
  };

  // Get active bookings for a specific car
  const getActiveBookingsForCar = (carId: string): Booking[] => {
    if (!carId) return [];
    return bookings.filter(b => b.carId === carId && b.status === 'active');
  };

  // Show all cars (both when creating and editing)
  const availableCars = cars;

  // Check for conflicts with current form data
  const conflictingBookings = useMemo(() => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return [];
    return checkDateConflict(
      formData.carId, 
      formData.startDate, 
      formData.pickUpTime || undefined,
      formData.endDate, 
      formData.returnTime || undefined,
      booking?.id
    );
  }, [formData.carId, formData.startDate, formData.pickUpTime, formData.endDate, formData.returnTime, booking?.id, bookings]);

  // Get active bookings for selected car
  const activeBookingsForSelectedCar = useMemo(() => {
    if (!formData.carId) return [];
    return getActiveBookingsForCar(formData.carId);
  }, [formData.carId, bookings]);

  useEffect(() => {
    if (booking) {
      setFormData({
        carId: booking.carId,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        clientEmail: booking.clientEmail || '',
        startDate: booking.startDate,
        pickUpTime: booking.pickUpTime || '',
        endDate: booking.endDate,
        returnTime: booking.returnTime || '',
        totalAmount: booking.totalAmount || '',
        discount: booking.discount !== undefined && booking.discount !== null ? booking.discount : '',
        isPaid: booking.isPaid !== undefined ? booking.isPaid : false,
        paymentMethod: booking.paymentMethod || '',
        status: booking.status
      });
      // Reset manual edit flag when loading existing booking
      setIsTotalAmountManuallyEdited(false);
    }
  }, [booking]);

  // Calculate total amount automatically when relevant fields change
  // Only auto-update if user hasn't manually edited the total
  useEffect(() => {
    if (formData.carId && formData.startDate && formData.endDate && !isTotalAmountManuallyEdited) {
      const car = cars.find(c => c.id === formData.carId);
      if (car) {
        // Calculate rental days using Excel formula logic
        const rentalDays = calculateRentalDays(
          formData.startDate,
          formData.pickUpTime || undefined,
          formData.endDate,
          formData.returnTime || undefined
        );
        
        // Use the daily rate at booking time if editing existing booking, otherwise use current car rate
        const dailyRate = booking?.dailyRateAtBooking || car.dailyRate;
        const baseTotal = rentalDays * dailyRate;
        
        // Apply discount if provided (handle empty string as 0)
        const discount = formData.discount === '' ? 0 : (typeof formData.discount === 'string' ? parseFloat(formData.discount) || 0 : formData.discount);
        const discountAmount = (baseTotal * discount) / 100;
        const finalTotal = baseTotal - discountAmount;
        
        setFormData(prev => ({ ...prev, totalAmount: finalTotal }));
      }
    }
  }, [formData.carId, formData.startDate, formData.pickUpTime, formData.endDate, formData.returnTime, formData.discount, cars, isTotalAmountManuallyEdited, booking]);

  // Reset manual edit flag when relevant fields change (so auto-calculation resumes)
  useEffect(() => {
    // Reset the flag when dates, times, car, or discount change
    // This allows auto-calculation to resume after field changes
    setIsTotalAmountManuallyEdited(false);
  }, [formData.carId, formData.startDate, formData.pickUpTime, formData.endDate, formData.returnTime, formData.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for conflicts before submitting
    if (conflictingBookings.length > 0) {
      // Don't submit if there are conflicts
      return;
    }
    
    // Convert empty discount and totalAmount strings to 0 before saving
    const dataToSave = {
      ...formData,
      discount: formData.discount === '' ? 0 : (typeof formData.discount === 'string' ? parseFloat(formData.discount) || 0 : formData.discount),
      totalAmount: formData.totalAmount === '' ? 0 : (typeof formData.totalAmount === 'string' ? parseFloat(formData.totalAmount) || 0 : formData.totalAmount),
      paymentMethod: formData.paymentMethod === '' ? undefined : formData.paymentMethod as 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other',
    };
    
    onSave(dataToSave);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'discount') {
      // Allow empty string for discount, convert to 0 only when needed
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue === '' ? '' : (isNaN(numValue) ? 0 : numValue)
      }));
    } else if (name === 'isPaid') {
      // Handle checkbox for isPaid
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'totalAmount') {
      // Handle totalAmount similar to discount - allow empty string
      setIsTotalAmountManuallyEdited(true); // Mark as manually edited
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue === '' ? '' : (isNaN(numValue) ? 0 : numValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const selectedCar = cars.find(c => c.id === formData.carId);

  // Helper function to format date and time (24-hour format)
  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    // Time is already in HH:mm format from input (24-hour), display it as is
    // If time exists, format it properly (remove seconds if present)
    if (time) {
      const timeOnly = time.split(':').slice(0, 2).join(':'); // Keep only HH:mm
      return `${dateStr} ${timeOnly}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {booking ? 'Ndrysho Rezervimin' : 'Rezervim i Ri'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Emri i Klientit
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="Emri dhe Mbiemri"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Numri i Telefonit
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                placeholder="+355 69 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Email <span className="text-gray-400 text-xs">(Opsionale)</span>
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                placeholder="klient@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car size={16} className="inline mr-1" />
                Zgjedh Makinën
              </label>
              <select
                name="carId"
                value={formData.carId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Zgjedh një makinë...</option>
                {availableCars.map((car) => {
                  const activeBookings = getActiveBookingsForCar(car.id);
                  const hasActiveBookings = activeBookings.length > 0;
                  const statusText = hasActiveBookings ? ' - E ZËNË' : '';
                  
                  return (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.year}) - €{car.dailyRate}/ditë{statusText}
                    </option>
                  );
                })}
              </select>
              {availableCars.length === 0 && (
                <p className="text-sm text-red-600 mt-1">Nuk ka makina të disponueshme për rezervim</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Data e Fillimit
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Ora e Marrjes
              </label>
              <input
                type="time"
                name="pickUpTime"
                value={formData.pickUpTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Opsionale</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Data e Përfundimit
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Ora e Kthimit
              </label>
              <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opsionale - Nëse pas 13:30, shtohet 1 ditë shtesë
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statusi
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="active">AKTIV</option>
                <option value="completed">PËRFUNDUAR</option>
                <option value="cancelled">ANULUAR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zbritje (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={formData.discount === '' ? '' : formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Opsionale - Zbritje në përqindje (0-100%)</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPaid"
                id="isPaid"
                checked={formData.isPaid}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPaid" className="ml-2 text-sm font-medium text-gray-700">
                E paguar
              </label>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.isPaid && (
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                      Metoda e Pagesës
                    </label>
                    <select
                      name="paymentMethod"
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Zgjedh metodën</option>
                      <option value="cash">Cash</option>
                      <option value="card">Kartë (Card)</option>
                      <option value="bank_transfer">Transfer Bankar (Bank Transfer)</option>
                      <option value="cheque">Çek (Cheque)</option>
                      <option value="other">Tjetër (Other)</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shuma Totale (EUR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount === '' ? '' : formData.totalAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">€</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const rentalDays = calculateRentalDays(
                    formData.startDate,
                    formData.pickUpTime || undefined,
                    formData.endDate,
                    formData.returnTime || undefined
                  );
                  
                  let message = `Ditët e qirasë: ${rentalDays} ditë`;
                  
                  if (formData.returnTime) {
                    const [hours, minutes] = formData.returnTime.split(':').map(Number);
                    if (hours > 13 || (hours === 13 && minutes > 30)) {
                      message += ' (shtuar 1 ditë për kohën pas 13:30)';
                    }
                  }
                  
                  if (formData.discount !== '' && formData.discount > 0) {
                    message += ` | Zbritje: ${formData.discount}%`;
                  }
                  
                  return message;
                })()}
              </p>
            </div>
          </div>

          {selectedCar && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Detajet e Makinës së Zgjedhur</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Makina:</span> {selectedCar.make} {selectedCar.model}
                  </div>
                  <div>
                    <span className="text-blue-600">Viti:</span> {selectedCar.year}
                  </div>
                  <div>
                    <span className="text-blue-600">Ngjyra:</span> {selectedCar.color}
                  </div>
                  <div>
                    <span className="text-blue-600">Çmimi:</span> €{selectedCar.dailyRate}/ditë
                  </div>
                </div>
              </div>

              {/* Show active bookings for selected car */}
              {activeBookingsForSelectedCar.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Rezervime Aktive për Këtë Makinë
                  </h4>
                  <div className="space-y-2 text-sm">
                    {activeBookingsForSelectedCar.map((activeBooking) => {
                      // Skip if this is the booking being edited
                      if (booking && activeBooking.id === booking.id) return null;
                      
                      return (
                        <div key={activeBooking.id} className="bg-white rounded p-2 border border-yellow-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-yellow-800">{activeBooking.clientName}</span>
                              <span className="text-yellow-600 ml-2">({activeBooking.clientPhone})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-yellow-700 font-medium block">
                                {formatDateTime(activeBooking.startDate, activeBooking.pickUpTime)} - {formatDateTime(activeBooking.endDate, activeBooking.returnTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show conflict warning if dates overlap */}
              {conflictingBookings.length > 0 && formData.startDate && formData.endDate && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Konflikt me Rezervime Ekzistuese!
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Makina është e rezervuar për datat që keni zgjedhur. Ju lutem zgjidhni data të tjera.
                  </p>
                  <div className="space-y-2 text-sm">
                    {conflictingBookings.map((conflict) => (
                      <div key={conflict.id} className="bg-white rounded p-2 border border-red-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-red-800">{conflict.clientName}</span>
                            <span className="text-red-600 ml-2">({conflict.clientPhone})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-red-700 font-medium block">
                              {formatDateTime(conflict.startDate, conflict.pickUpTime)} - {formatDateTime(conflict.endDate, conflict.returnTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={availableCars.length === 0 || conflictingBookings.length > 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {booking ? 'Ndrysho' : 'Shto Rezervimin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;