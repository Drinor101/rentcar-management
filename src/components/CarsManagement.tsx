import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Car } from '../types';
import CarModal from './CarModal';

interface CarsManagementProps {
  cars: Car[];
  onAddCar: (car: Omit<Car, 'id'>) => void;
  onUpdateCar: (id: string, car: Omit<Car, 'id'>) => void;
  onDeleteCar: (id: string) => void;
}

const CarsManagement: React.FC<CarsManagementProps> = ({
  cars,
  onAddCar,
  onUpdateCar,
  onDeleteCar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || car.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddCar = () => {
    setEditingCar(null);
    setIsModalOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleSaveCar = (carData: Omit<Car, 'id'>) => {
    if (editingCar) {
      onUpdateCar(editingCar.id, carData);
    } else {
      onAddCar(carData);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'E Disponueshme';
      case 'rented': return 'E Qira';
      case 'maintenance': return 'Mirëmbajtje';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko makina..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Të Gjitha Statuset</option>
            <option value="available">E Disponueshme</option>
            <option value="rented">E Qira</option>
            <option value="maintenance">Mirëmbajtje</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Të Gjitha Kategoritë</option>
            <option value="economy">Ekonomike</option>
            <option value="compact">Kompakte</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luksoze</option>
          </select>
          
          <button
            onClick={handleAddCar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Shto Makinë
          </button>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gray-200">
              <img
                src={car.image}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                  {getStatusText(car.status)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{car.make} {car.model}</h3>
              <p className="text-sm text-gray-600 mb-2">{car.year} • {car.color}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Targë: {car.licensePlate}</span>
                <span className="text-lg font-bold text-blue-600">€{car.dailyRate}/ditë</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCar(car)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit size={16} />
                  Ndrysho
                </button>
                <button
                  onClick={() => onDeleteCar(car.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk u gjetën makina</h3>
          <p className="text-gray-500">Provo të ndryshosh kriteret e kërkimit ose shto makina të reja.</p>
        </div>
      )}

      {/* Car Modal */}
      {isModalOpen && (
        <CarModal
          car={editingCar}
          onSave={handleSaveCar}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CarsManagement;