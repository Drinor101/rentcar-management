import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Booking, Car as CarType } from '../types';

interface ExtendBookingModalProps {
  booking: Booking;
  car: CarType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onExtend: (newEndDate: string, newTotalAmount: number) => void;
}

const ExtendBookingModal: React.FC<ExtendBookingModalProps> = ({
  booking,
  car,
  isOpen,
  onClose,
  onExtend
}) => {
  const [newEndDate, setNewEndDate] = useState(booking.endDate);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [newTotalAmount, setNewTotalAmount] = useState(0);

  useEffect(() => {
    if (newEndDate && car) {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(newEndDate);
      
      if (endDate > startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        const total = days * car.dailyRate;
        
        setCalculatedDays(days);
        setNewTotalAmount(total);
      } else {
        setCalculatedDays(0);
        setNewTotalAmount(0);
      }
    }
  }, [newEndDate, booking.startDate, car]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEndDate) {
      alert('Ju lutem vendosni një datë të re të përfundimit');
      return;
    }

    const newEndDateObj = new Date(newEndDate);
    const startDateObj = new Date(booking.startDate);

    if (newEndDateObj <= startDateObj) {
      alert('Data e përfundimit duhet të jetë pas datës së fillimit!');
      return;
    }

    // Allow extending or shortening the booking
    onExtend(newEndDate, newTotalAmount);
  };

  if (!isOpen) return null;

  const currentDays = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1; // +1 to include both start and end dates
  const additionalDays = calculatedDays - currentDays;
  const additionalAmount = newTotalAmount - booking.totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Zgjat Rezervimin</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">Klienti:</p>
            <p className="font-semibold text-gray-800">{booking.clientName}</p>
            
            <p className="text-sm text-gray-600 mt-3">Makina:</p>
            <p className="font-semibold text-gray-800">
              {car?.make} {car?.model}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-600">Data Fillimit:</p>
                <p className="font-medium text-gray-800">
                  {new Date(booking.startDate).toLocaleDateString('sq-AL')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Aktuale e Përfundimit:</p>
                <p className="font-medium text-gray-800">
                  {new Date(booking.endDate).toLocaleDateString('sq-AL')}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ditët Aktuale:</span>
                <span className="font-semibold text-gray-800">{currentDays} ditë</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-600">Shuma Aktuale:</span>
                <span className="font-semibold text-gray-800">€{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* New End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Data e Re e Përfundimit
            </label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={booking.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mund të zgjasësh ose të shkurtosh rezervimin (duhet të jetë pas datës së fillimit)
            </p>
          </div>

          {/* Calculation Preview */}
          {calculatedDays !== currentDays && (
            <div className={`border rounded-lg p-4 space-y-2 ${
              calculatedDays > currentDays 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className={calculatedDays > currentDays ? 'text-green-600' : 'text-orange-600'} />
                <h4 className={`font-medium ${calculatedDays > currentDays ? 'text-green-800' : 'text-orange-800'}`}>
                  Llogaritja e Re
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ditët e Reja:</span>
                  <span className="font-semibold text-gray-800">{calculatedDays} ditë</span>
                </div>
                {calculatedDays > currentDays ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ditët Shtesë:</span>
                      <span className="font-semibold text-green-600">+{additionalDays} ditë</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-200">
                      <span className="text-gray-600">Shuma e Re:</span>
                      <span className="font-bold text-green-700">€{newTotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shuma Shtesë:</span>
                      <span className="font-semibold text-green-600">+€{additionalAmount.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ditët e Redukuara:</span>
                      <span className="font-semibold text-orange-600">-{Math.abs(additionalDays)} ditë</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-orange-200">
                      <span className="text-gray-600">Shuma e Re:</span>
                      <span className="font-bold text-orange-700">€{newTotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shuma e Reduktuar:</span>
                      <span className="font-semibold text-orange-600">-€{Math.abs(additionalAmount).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
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
              disabled={!newEndDate || new Date(newEndDate) <= new Date(booking.startDate) || calculatedDays === 0}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {calculatedDays > currentDays ? 'Zgjat Rezervimin' : calculatedDays < currentDays ? 'Shkurt Rezervimin' : 'Ruaj Ndryshimet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtendBookingModal;

