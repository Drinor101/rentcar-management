import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, Clock } from 'lucide-react';
import { Booking, Car as CarType } from '../types';
import { calculateRentalDays } from '../utils/dateCalculations';

interface CalendarViewProps {
  bookings: Booking[];
  cars: CarType[];
  onBookingClick?: (booking: Booking) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, cars, onBookingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Month names in Albanian
  const monthNames = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ];

  // Day names starting with Monday (E Hënë) as first day
  const dayNames = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];
  const dayNamesShort = ['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'];

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Adjust for Monday as first day of week
  // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // We want: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const checkDate = new Date(dateStr);
      
      // Check if date is between start and end (inclusive)
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Get status color for booking
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(currentYear, currentMonth, day),
        isCurrentMonth: true
      });
    }
    
    // Don't add empty cells at the end - only show actual days of the month
    
    return days;
  }, [currentYear, currentMonth, adjustedStartingDay, daysInMonth]);

  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with month navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Month Navigation Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-white"
                title="Muaji i kaluar"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-white"
                title="Muaji i ardhshëm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              Sot
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNamesShort.map((day, index) => (
              <div
                key={index}
                className="p-3 text-center text-sm font-bold text-gray-700 bg-gray-50 rounded-lg"
              >
                {day}
              </div>
            ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => {
            const date = dayData.date;
            const isCurrentMonthDay = dayData.isCurrentMonth;
            const dayBookings = date ? getBookingsForDate(date) : [];
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[140px] border-2 rounded-lg p-2 transition-all ${
                  isCurrentMonthDay 
                    ? isTodayDate
                      ? 'bg-blue-50 border-blue-400 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                {date && (
                  <>
                    {/* Date number */}
                    <div className={`text-base font-bold mb-2 ${
                      isTodayDate 
                        ? 'text-blue-600' 
                        : isCurrentMonthDay 
                          ? 'text-gray-800' 
                          : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* Bookings for this day */}
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                      {dayBookings.map((booking) => {
                        const car = cars.find(c => c.id === booking.carId);
                        const statusColor = getStatusColor(booking.status);
                        
                        return (
                          <div
                            key={booking.id}
                            onClick={() => onBookingClick?.(booking)}
                            className={`${statusColor} text-white text-xs p-1.5 rounded-md cursor-pointer hover:opacity-90 hover:shadow-md transition-all`}
                            title={`${booking.clientName} - ${car?.make} ${car?.model}${booking.pickUpTime ? ` (${booking.pickUpTime.split(':').slice(0, 2).join(':')})` : ''}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Car size={11} className="flex-shrink-0" />
                              <span className="truncate font-semibold">
                                {booking.clientName}
                              </span>
                            </div>
                            {booking.pickUpTime && (
                              <div className="flex items-center gap-1 text-[10px] opacity-95 mt-0.5">
                                <Clock size={9} />
                                <span>{booking.pickUpTime.split(':').slice(0, 2).join(':')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon size={18} className="text-blue-600" />
          Legjenda
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-md shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">AKTIV</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-md shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">PËRFUNDUAR</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-md shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">ANULUAR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
