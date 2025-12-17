import React, { useState, useMemo } from 'react';
import { FileText, Download, Calendar, Filter, X } from 'lucide-react';
import { Report } from '../types';
import { calculateRentalDays } from '../utils/dateCalculations';

interface ReportsPageProps {
  reports: Report[];
  isOpen: boolean;
  onClose: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ reports, isOpen, onClose }) => {
  const [filterType, setFilterType] = useState<'date' | 'month' | 'year'>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Generate year options (last 5 years to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Generate month options
  const monthOptions = [
    { value: '01', label: 'Janar' },
    { value: '02', label: 'Shkurt' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Prill' },
    { value: '05', label: 'Maj' },
    { value: '06', label: 'Qershor' },
    { value: '07', label: 'Korrik' },
    { value: '08', label: 'Gusht' },
    { value: '09', label: 'Shtator' },
    { value: '10', label: 'Tetor' },
    { value: '11', label: 'Nëntor' },
    { value: '12', label: 'Dhjetor' }
  ];

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by date/month/year
    if (filterType === 'date' && selectedDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.startDate).toISOString().split('T')[0];
        return reportDate === selectedDate;
      });
    } else if (filterType === 'month' && selectedMonth && selectedYear) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.startDate);
        return reportDate.getMonth() + 1 === parseInt(selectedMonth) && 
               reportDate.getFullYear() === parseInt(selectedYear);
      });
    } else if (filterType === 'year' && selectedYear) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.startDate);
        return reportDate.getFullYear() === parseInt(selectedYear);
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, filterType, selectedDate, selectedMonth, selectedYear, statusFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = filteredReports.reduce((sum, report) => sum + report.totalAmount, 0);
    const totalBookings = filteredReports.length;
    const totalDays = filteredReports.reduce((sum, report) => {
      const calculatedDays = calculateRentalDays(
        report.startDate,
        report.pickUpTime,
        report.endDate,
        report.returnTime
      );
      return sum + calculatedDays;
    }, 0);
    return { totalRevenue, totalBookings, totalDays };
  }, [filteredReports]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Makina', 'Klienti', 'Telefoni', 'Data Fillimit', 'Data Përfundimit', 'Ditët', 'Çmimi Ditor', 'Zbritje', 'Shuma Totale', 'E paguar', 'Metoda e Pagesës', 'Statusi', 'Data Krijimit'];
    const rows = filteredReports.map(report => [
      report.id,
      `${report.carMake} ${report.carModel}`,
      report.clientName,
      report.clientPhone,
      new Date(report.startDate).toLocaleDateString('sq-AL'),
      new Date(report.endDate).toLocaleDateString('sq-AL'),
      calculateRentalDays(
        report.startDate,
        report.pickUpTime,
        report.endDate,
        report.returnTime
      ).toString(),
      `€${report.dailyRate}`,
      report.discount && report.discount > 0 ? `€${Number(report.discount) % 1 === 0 ? Number(report.discount).toFixed(0) : Number(report.discount).toFixed(2)}` : '-',
      `€${Number(report.totalAmount) % 1 === 0 ? Number(report.totalAmount).toFixed(0) : Number(report.totalAmount).toFixed(2)}`,
      report.isPaid ? 'Po' : 'Jo',
      report.paymentMethod ? (
        report.paymentMethod === 'cash' ? 'Cash' : 
        report.paymentMethod === 'card' ? 'Kartë' : 
        report.paymentMethod === 'bank_transfer' ? 'Transfer Bankar' : 
        report.paymentMethod === 'cheque' ? 'Çek' : 
        'Tjetër'
      ) : '-',
      report.status === 'active' ? 'AKTIV' : report.status === 'completed' ? 'PËRFUNDUAR' : 'ANULUAR',
      new Date(report.createdAt).toLocaleDateString('sq-AL')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `raporti_${filterType}_${selectedDate || selectedMonth || selectedYear || 'të_gjitha'}_${new Date().getTime()}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'AKTIV';
      case 'completed': return 'PËRFUNDUAR';
      case 'cancelled': return 'ANULUAR';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Raporte</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Lloji i Filtrit
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'date' | 'month' | 'year');
                  setSelectedDate('');
                  setSelectedMonth('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sipas Datës</option>
                <option value="month">Sipas Muajit</option>
                <option value="year">Sipas Vitit</option>
              </select>
            </div>

            {/* Date Filter */}
            {filterType === 'date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Month Filter */}
            {filterType === 'month' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Muaji
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Zgjedh Muajin</option>
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viti
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Year Filter */}
            {filterType === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Viti
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statusi
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Të Gjitha</option>
                <option value="active">AKTIVE</option>
                <option value="completed">TË PËRFUNDUARA</option>
                <option value="cancelled">TË ANULUARA</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Rezervime</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Ditë</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalDays}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Të Ardhurat Totale</p>
              <p className="text-2xl font-bold text-blue-600">
                €{Number(totals.totalRevenue) % 1 === 0 ? Number(totals.totalRevenue).toLocaleString() : Number(totals.totalRevenue).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={20} />
              Eksporto si CSV
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk u gjetën raporte</h3>
              <p className="text-gray-500">Nuk ka raporte që përputhen me kriteret e kërkimit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Makina</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Klienti</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Telefoni</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data Fillimit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data Përfundimit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ditët</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Çmimi Ditor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Zbritje</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Shuma Totale</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">E paguar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Metoda e Pagesës</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{report.carMake} {report.carModel}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{report.clientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.clientPhone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(report.startDate).toLocaleDateString('sq-AL')}
                        {report.pickUpTime && (
                          <span className="ml-1 text-gray-500">
                            ({report.pickUpTime.split(':').slice(0, 2).join(':')})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(report.endDate).toLocaleDateString('sq-AL')}
                        {report.returnTime && (
                          <span className="ml-1 text-gray-500">
                            ({report.returnTime.split(':').slice(0, 2).join(':')})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {calculateRentalDays(
                          report.startDate,
                          report.pickUpTime,
                          report.endDate,
                          report.returnTime
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        €{Number(report.dailyRate) % 1 === 0 ? Number(report.dailyRate).toFixed(0) : Number(report.dailyRate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {report.discount && report.discount > 0 ? (
                          <span className="text-orange-600 font-medium">€{Number(report.discount) % 1 === 0 ? Number(report.discount).toFixed(0) : Number(report.discount).toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        €{Number(report.totalAmount) % 1 === 0 ? Number(report.totalAmount).toFixed(0) : Number(report.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`font-medium ${report.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {report.isPaid ? 'E paguar' : 'E papaguar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {report.paymentMethod ? (
                          report.paymentMethod === 'cash' ? 'Cash' : 
                          report.paymentMethod === 'card' ? 'Kartë' : 
                          report.paymentMethod === 'bank_transfer' ? 'Transfer Bankar' : 
                          report.paymentMethod === 'cheque' ? 'Çek' : 
                          'Tjetër'
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

