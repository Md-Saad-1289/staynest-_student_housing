import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/api';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications(100);
      setNotifications(res.data.notifications || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((s) => s.map(n => n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n));
    } catch (err) {
      setError('Failed to mark notification');
    }
  };

  const markAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((s) => s.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((s) => s.filter(n => n._id !== id));
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              <i className="fas fa-bell text-blue-600 mr-3"></i>Notifications
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-semibold text-gray-600">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </div>
          </div>
          <p className="text-gray-600">Stay updated with your booking and listing activities</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <i className="fas fa-exclamation-circle flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={markAll}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-check-double"></i> Mark All as Read
          </button>
          <button
            onClick={fetchNotifications}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
            <p className="text-lg text-gray-600 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-2">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`rounded-xl border transition-all ${
                  n.read
                    ? 'bg-white border-gray-200 hover:border-gray-300'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-md'
                }`}
              >
                <div className="p-6 flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    n.read
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-blue-500 text-white'
                  }`}>
                    <i className="fas fa-envelope"></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{n.title}</h3>
                      {!n.read && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span> New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{n.message}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-1"
                      >
                        <i className="fas fa-check"></i> Read
                      </button>
                    )}
                    <button
                      onClick={() => remove(n._id)}
                      className="px-3 py-1 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
