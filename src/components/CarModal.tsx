import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Car } from '../types';

interface CarModalProps {
  car: Car | null;
  onSave: (car: Omit<Car, 'id'>) => void;
  onClose: () => void;
}

const CarModal: React.FC<CarModalProps> = ({ car, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    dailyRate: 0,
    image: '',
    status: 'available' as Car['status'],
    category: 'compact' as Car['category']
  });

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        licensePlate: car.licensePlate,
        dailyRate: car.dailyRate,
        image: car.image,
        status: car.status,
        category: car.category
      });
    }
  }, [car]);

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

  const sampleImages = [
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=500'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {car ? 'Ndrysho Makinën' : 'Shto Makinë të Re'}
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
                Marka
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modeli
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Viti
              </label>
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngjyra
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Targë
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çmimi Ditor (EUR)
              </label>
              <input
                type="number"
                name="dailyRate"
                min="0"
                step="0.01"
                value={formData.dailyRate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="economy">Ekonomike</option>
                <option value="compact">Kompakte</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luksoze</option>
              </select>
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
                <option value="available">E Disponueshme</option>
                <option value="rented">E Qira</option>
                <option value="maintenance">Mirëmbajtje</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto e Makinës
            </label>
            <div className="space-y-3">
              <input
                type="url"
                name="image"
                placeholder="Fut URL e fotos..."
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              
              <div className="text-sm text-gray-600">Ose zgjidh nga fotot e gatshme:</div>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: imageUrl }))}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 hover:border-blue-500 transition-colors ${
                      formData.image === imageUrl ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {formData.image && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Pamja:</div>
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {car ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarModal;