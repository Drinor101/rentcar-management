import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Check } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
      case 'info': return <Info size={20} className="text-blue-500" />;
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'warning': return `bg-orange-${opacity} border-orange-200`;
      case 'info': return `bg-blue-${opacity} border-blue-200`;
      case 'success': return `bg-green-${opacity} border-green-200`;
      default: return `bg-gray-${opacity} border-gray-200`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Njoftime</h1>
          <p className="text-gray-600">{unreadCount} njoftime të palexuara</p>
        </div>
        
        <div className="flex gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Të Gjitha</option>
            <option value="unread">Të Palexuara</option>
            <option value="read">Të Lexuara</option>
          </select>
          
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Shëno të Gjitha si të Lexuara
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              getBackgroundColor(notification.type, notification.read)
            } ${!notification.read ? 'shadow-md' : 'shadow-sm'}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleDateString('sq-AL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Shëno si të lexuar"
                  >
                    <Check size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => onDeleteNotification(notification.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Fshi njoftimin"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'unread' ? 'Nuk ka njoftime të palexuara' : 
             filter === 'read' ? 'Nuk ka njoftime të lexuara' : 
             'Nuk ka njoftime'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Njoftimet do të shfaqen këtu kur të jenë të disponueshme.' :
             'Provo të ndryshosh filtrin për të parë njoftime të tjera.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;