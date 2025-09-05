import React, { useState } from 'react';
import { Car, Settings, Calendar, Bell, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  notifications: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, notifications }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'cars', label: 'Makina', icon: Car },
    { id: 'bookings', label: 'Rezervime', icon: Calendar },
    { id: 'notifications', label: 'Njoftime', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}>
        
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">RentCar Pro</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
                {item.id === 'notifications' && notifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {notifications}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            
            <h2 className="text-2xl font-semibold text-gray-800 capitalize">
              {currentPage === 'dashboard' ? 'Dashboard' :
               currentPage === 'cars' ? 'Menaxhimi i Makinave' :
               currentPage === 'bookings' ? 'Rezervimet' :
               currentPage === 'notifications' ? 'Njoftime' : currentPage}
            </h2>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('sq-AL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;