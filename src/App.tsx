import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CarsManagement from './components/CarsManagement';
import BookingsManagement from './components/BookingsManagement';
import NotificationsPage from './components/NotificationsPage';
import { mockCars, mockBookings, mockNotifications } from './data/mockData';
import { Car, Booking, Notification } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cars, setCars] = useState<Car[]>(mockCars);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Car management functions
  const handleAddCar = (carData: Omit<Car, 'id'>) => {
    const newCar: Car = {
      ...carData,
      id: Date.now().toString()
    };
    setCars(prev => [...prev, newCar]);
    
    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      message: `Makina e re ${carData.make} ${carData.model} u shtua me sukses`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleUpdateCar = (id: string, carData: Omit<Car, 'id'>) => {
    setCars(prev => prev.map(car => car.id === id ? { ...carData, id } : car));
    
    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      message: `Makina ${carData.make} ${carData.model} u ndryshua`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleDeleteCar = (id: string) => {
    const car = cars.find(c => c.id === id);
    setCars(prev => prev.filter(c => c.id !== id));
    
    if (car) {
      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'warning',
        message: `Makina ${car.make} ${car.model} u fshi`,
        date: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Booking management functions
  const handleAddBooking = (bookingData: Omit<Booking, 'id'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString()
    };
    setBookings(prev => [...prev, newBooking]);
    
    // Update car status to rented if booking is active
    if (bookingData.status === 'active') {
      setCars(prev => prev.map(car => 
        car.id === bookingData.carId 
          ? { ...car, status: 'rented' as Car['status'] }
          : car
      ));
    }
    
    // Add notification
    const car = cars.find(c => c.id === bookingData.carId);
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      message: `Rezervim i ri nga ${bookingData.clientName} për ${car?.make} ${car?.model}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleUpdateBooking = (id: string, bookingData: Omit<Booking, 'id'>) => {
    const oldBooking = bookings.find(b => b.id === id);
    setBookings(prev => prev.map(booking => booking.id === id ? { ...bookingData, id } : booking));
    
    // Update car status based on booking status
    if (oldBooking && oldBooking.carId !== bookingData.carId) {
      // If car changed, make old car available and new car rented
      setCars(prev => prev.map(car => {
        if (car.id === oldBooking.carId) {
          return { ...car, status: 'available' as Car['status'] };
        }
        if (car.id === bookingData.carId && bookingData.status === 'active') {
          return { ...car, status: 'rented' as Car['status'] };
        }
        return car;
      }));
    } else if (bookingData.status !== 'active' && oldBooking?.status === 'active') {
      // If booking is no longer active, make car available
      setCars(prev => prev.map(car => 
        car.id === bookingData.carId 
          ? { ...car, status: 'available' as Car['status'] }
          : car
      ));
    } else if (bookingData.status === 'active' && oldBooking?.status !== 'active') {
      // If booking became active, make car rented
      setCars(prev => prev.map(car => 
        car.id === bookingData.carId 
          ? { ...car, status: 'rented' as Car['status'] }
          : car
      ));
    }
    
    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      message: `Rezervimi i ${bookingData.clientName} u ndryshua`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Notification management functions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard cars={cars} bookings={bookings} notifications={unreadNotifications} />;
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
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      default:
        return <Dashboard cars={cars} bookings={bookings} notifications={unreadNotifications} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      notifications={unreadNotifications}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;