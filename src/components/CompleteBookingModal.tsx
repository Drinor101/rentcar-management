import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Euro, AlertTriangle } from 'lucide-react';
import { Booking, Car as CarType } from '../types';

interface CompleteBookingModalProps {
  booking: Booking;
  car: CarType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (actualEndDate: string, newTotalAmount: number) => void;
}

const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({
  booking,
  car,
  isOpen,
  onClose,
  onComplete
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [actualEndDate, setActualEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Reset to today's date when modal opens
  useEffect(() => {
    if (isOpen) {
      setActualEndDate(new Date().toISOString().split('T')[0]);
      setConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDate = new Date(booking.startDate);
  const originalEndDate = new Date(booking.endDate);
  const newEndDate = new Date(actualEndDate);
  
  // Calculate actual days used (inclusive of both start and end dates)
  const actualDays = Math.ceil((newEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const originalDays = Math.ceil((originalEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate new total amount based on actual days
  const newTotalAmount = car ? actualDays * car.dailyRate : booking.totalAmount;
  const amountDifference = newTotalAmount - booking.totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmed && actualDays > 0) {
      onComplete(actualEndDate, newTotalAmount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Përfundo Rezervimin</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Klienti</p>
              <p className="font-semibold text-gray-800 text-lg">{booking.clientName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Makina</p>
                <p className="font-medium text-gray-800">
                  {car?.make} {car?.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Targë</p>
                <p className="font-medium text-gray-800">{car?.licensePlate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-gray-500" />
                  <p className="text-sm text-gray-600">Data Fillimit</p>
                </div>
                <p className="font-medium text-gray-800">
                  {startDate.toLocaleDateString('sq-AL')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-gray-500" />
                  <p className="text-sm text-gray-600">Data e Planifikuar</p>
                </div>
                <p className="font-medium text-gray-800">
                  {originalEndDate.toLocaleDateString('sq-AL')}
                </p>
              </div>
            </div>

            {/* Actual End Date Input */}
            <div className="pt-3 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Data Aktuale e Përfundimit
              </label>
              <input
                type="date"
                value={actualEndDate}
                onChange={(e) => setActualEndDate(e.target.value)}
                min={booking.startDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Vendos datën kur klienti ktheu makinën (zakonisht sot)
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Euro size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Ditët e Planifikuara:</span>
                </div>
                <span className="font-semibold text-gray-800">{originalDays} ditë</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ditët Aktuale:</span>
                <span className="font-semibold text-blue-600">{actualDays} ditë</span>
              </div>
              
              {amountDifference !== 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Shuma e Planifikuar:</span>
                    <span className="font-medium text-gray-700">€{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ndryshimi:</span>
                    <span className={`font-semibold ${amountDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {amountDifference > 0 ? '+' : ''}€{amountDifference.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Shuma e Re Totale:</span>
                  <span className="text-2xl font-bold text-blue-600">€{newTotalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Kujdes!</h4>
                <p className="text-sm text-yellow-700">
                  Pas përfundimit të rezervimit, makina do të bëhet automatikisht e disponueshme për rezervime të reja.
                  Statusi i rezervimit do të ndryshojë në "PËRFUNDUAR".
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirm" className="text-sm text-gray-700 cursor-pointer">
              Konfirmoj që dëshiroj të përfundoj këtë rezervim dhe makina do të bëhet e disponueshme.
            </label>
          </div>

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
              disabled={!confirmed}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Përfundo Rezervimin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteBookingModal;

