import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Car } from 'lucide-react';
import { Booking, Car as CarType } from '../types';

interface BookingModalProps {
  booking: Booking | null;
  cars: CarType[];
  onSave: (booking: Omit<Booking, 'id'>) => void;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ booking, cars, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    carId: '',
    clientName: '',
    clientPhone: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    status: 'active' as Booking['status']
  });

  const availableCars = cars.filter(car => car.status === 'available');

  useEffect(() => {
    if (booking) {
      setFormData({
        carId: booking.carId,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        status: booking.status
      });
    }
  }, [booking]);

  const calculateTotalAmount = () => {
    if (formData.carId && formData.startDate && formData.endDate) {
      const car = cars.find(c => c.id === formData.carId);
      if (car) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const total = diffDays * car.dailyRate;
        setFormData(prev => ({ ...prev, totalAmount: total }));
      }
    }
  };

  useEffect(() => {
    calculateTotalAmount();
  }, [formData.carId, formData.startDate, formData.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const selectedCar = cars.find(c => c.id === formData.carId);

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
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.year}) - €{car.dailyRate}/ditë
                  </option>
                ))}
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
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
                Shuma Totale (EUR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
                <span className="absolute right-3 top-2 text-gray-500">€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Shuma llogaritet automatikisht bazuar në ditët dhe çmimin ditor</p>
            </div>
          </div>

          {selectedCar && (
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
              disabled={availableCars.length === 0}
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