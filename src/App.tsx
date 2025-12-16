import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CarsManagement from './components/CarsManagement';
import BookingsManagement from './components/BookingsManagement';
import ReportsPage from './components/ReportsPage';
import UsersManagement from './components/UsersManagement';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { carsService } from './services/carsService';
import { bookingsService } from './services/bookingsService';
import { reportsService } from './services/reportsService';
import { Car, Booking, Report } from './types';

function AppContent() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const loadAllData = async () => {
    if (!user || !profile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // All users can see all cars
      const carsData = await carsService.getAll();
      setCars(carsData);
      
      // Filter bookings based on role
      let bookingsData: Booking[];
      if (isAdmin) {
        bookingsData = await bookingsService.getAll();
      } else {
        // Puntor sees only their own bookings
        bookingsData = await bookingsService.getByUserId(user.id);
      }
      setBookings(bookingsData);
      
      // Filter reports based on role
      let reportsData: Report[];
      if (isAdmin) {
        reportsData = await reportsService.getAll();
      } else {
        // Puntor sees only their own reports
        reportsData = await reportsService.getByUserId(user.id);
      }
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data from Supabase on mount
  useEffect(() => {
    if (user && profile) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, isAdmin]);

  // Generate all reports from Supabase
  const allReports = useMemo(() => {
    return reports;
  }, [reports]);

  // Car management functions
  const handleAddCar = async (carData: Omit<Car, 'id'>) => {
    try {
      const newCar = await carsService.create(carData);
      setCars(prev => [...prev, newCar]);
      toast.success('Makina u shtua me sukses!');
    } catch (err) {
      console.error('Error adding car:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add car';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  const handleUpdateCar = async (id: string, carData: Omit<Car, 'id'>) => {
    const oldCar = cars.find(c => c.id === id);
    
    // Optimistic update
    setCars(prev => prev.map(car => car.id === id ? { ...car, ...carData } as Car : car));
    
    try {
      const updatedCar = await carsService.update(id, carData);
      setCars(prev => prev.map(car => car.id === id ? updatedCar : car));
      
      // If daily rate changed, update active bookings for this car
      if (oldCar && oldCar.dailyRate !== carData.dailyRate) {
        const activeBookingsForCar = bookings.filter(
          b => b.carId === id && b.status === 'active'
        );
        
        for (const booking of activeBookingsForCar) {
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
          const newTotalAmount = days * carData.dailyRate;
          
          await bookingsService.update(booking.id, {
            ...booking,
            totalAmount: newTotalAmount
          });
        }
        
        // Reload bookings to reflect changes
        const updatedBookings = await bookingsService.getAll();
        setBookings(updatedBookings);
        
        // Reload reports
        const updatedReports = await reportsService.getAll();
        setReports(updatedReports);
      }
      
      toast.success('Makina u përditësua me sukses!');
    } catch (err) {
      // Rollback on error
      setCars(prev => prev.map(car => car.id === id ? oldCar! : car));
      console.error('Error updating car:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update car';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  const handleDeleteCar = async (id: string) => {
    const carToDelete = cars.find(c => c.id === id);
    
    // Optimistic update
    setCars(prev => prev.filter(c => c.id !== id));
    
    try {
      await carsService.delete(id);
      toast.success('Makina u fshi me sukses!');
    } catch (err) {
      // Rollback on error
      if (carToDelete) {
        setCars(prev => [...prev, carToDelete].sort((a, b) => a.make.localeCompare(b.make)));
      }
      console.error('Error deleting car:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete car';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  // Booking management functions
  const handleAddBooking = async (bookingData: Omit<Booking, 'id'>) => {
    if (!user) return;
    
    try {
      // Add created_by to booking
      const bookingWithUser: Omit<Booking, 'id'> = {
        ...bookingData,
        createdBy: user.id,
      };
      const newBooking = await bookingsService.create(bookingWithUser);
      setBookings(prev => [...prev, newBooking]);
      
      // Update car status to rented if booking is active
      if (bookingData.status === 'active') {
        await carsService.update(bookingData.carId, { status: 'rented' });
        setCars(prev => prev.map(car => 
          car.id === bookingData.carId 
            ? { ...car, status: 'rented' as Car['status'] }
            : car
        ));
      }
      
      // Reload reports to get the new one from database
      const updatedReports = await reportsService.getAll();
      setReports(updatedReports);
      
      toast.success('Rezervimi u shtua me sukses!');
    } catch (err) {
      console.error('Error adding booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add booking';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  const handleUpdateBooking = async (id: string, bookingData: Omit<Booking, 'id'>) => {
    const oldBooking = bookings.find(b => b.id === id);
    
    // Optimistic update
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, ...bookingData } as Booking : booking
    ));
    
    try {
      const updatedBooking = await bookingsService.update(id, bookingData);
      setBookings(prev => prev.map(booking => booking.id === id ? updatedBooking : booking));
      
      // Update car status based on booking status
      if (oldBooking && oldBooking.carId !== bookingData.carId) {
        // If car changed, make old car available and new car rented
        if (oldBooking.carId) {
          await carsService.update(oldBooking.carId, { status: 'available' });
        }
        if (bookingData.status === 'active') {
          await carsService.update(bookingData.carId, { status: 'rented' });
        }
        // Reload cars to reflect changes
        const updatedCars = await carsService.getAll();
        setCars(updatedCars);
      } else if (bookingData.status !== 'active' && oldBooking?.status === 'active') {
        // If booking is no longer active, make car available
        await carsService.update(bookingData.carId, { status: 'available' });
        setCars(prev => prev.map(car => 
          car.id === bookingData.carId 
            ? { ...car, status: 'available' as Car['status'] }
            : car
        ));
      } else if (bookingData.status === 'active' && oldBooking?.status !== 'active') {
        // If booking became active, make car rented
        await carsService.update(bookingData.carId, { status: 'rented' });
        setCars(prev => prev.map(car => 
          car.id === bookingData.carId 
            ? { ...car, status: 'rented' as Car['status'] }
            : car
        ));
      }
      
      // Reload reports to get updated data from database
      const updatedReports = await reportsService.getAll();
      setReports(updatedReports);
      
      toast.success('Rezervimi u përditësua me sukses!');
    } catch (err) {
      // Rollback on error
      setBookings(prev => prev.map(booking => booking.id === id ? oldBooking! : booking));
      console.error('Error updating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const bookingToDelete = bookings.find(b => b.id === id);
    
    // Optimistic update
    setBookings(prev => prev.filter(b => b.id !== id));
    
    // If booking was active, make car available optimistically
    if (bookingToDelete && bookingToDelete.status === 'active') {
      setCars(prev => prev.map(car => 
        car.id === bookingToDelete.carId 
          ? { ...car, status: 'available' as Car['status'] }
          : car
      ));
    }
    
    try {
      await bookingsService.delete(id);
      
      // If booking was active, make car available
      if (bookingToDelete && bookingToDelete.status === 'active') {
        await carsService.update(bookingToDelete.carId, { status: 'available' });
      }
      
      // Reload reports
      const updatedReports = await reportsService.getAll();
      setReports(updatedReports);
      
      toast.success('Rezervimi u fshi me sukses!');
    } catch (err) {
      // Rollback on error
      if (bookingToDelete) {
        setBookings(prev => [...prev, bookingToDelete].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ));
        
        if (bookingToDelete.status === 'active') {
          setCars(prev => prev.map(car => 
            car.id === bookingToDelete.carId 
              ? { ...car, status: 'rented' as Car['status'] }
              : car
          ));
        }
      }
      
      console.error('Error deleting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      toast.error(`Gabim: ${errorMessage}`);
    }
  };

  // Show login if not authenticated (after all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg animate-pulse">Duke ngarkuar...</p>
          <p className="text-gray-500 text-sm mt-2">Flexrent Prishtina</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard cars={cars} bookings={bookings} />;
      case 'cars':
        return (
          <CarsManagement
            cars={cars}
            onAddCar={handleAddCar}
            onUpdateCar={handleUpdateCar}
            onDeleteCar={handleDeleteCar}
          />
        );
      case 'bookings':
        return (
          <BookingsManagement 
            bookings={bookings} 
            cars={cars}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        );
      case 'users':
        return <UsersManagement />;
      default:
        return <Dashboard cars={cars} bookings={bookings} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar të dhënat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Gabim</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAllData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Provo Përsëri
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onOpenReports={() => setIsReportsModalOpen(true)}
        isAdmin={isAdmin}
      >
        {renderCurrentPage()}
      </Layout>
      
      <ReportsPage
        reports={allReports}
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
      
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;