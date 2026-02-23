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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <button onClick={markAll} className="px-4 py-2 bg-blue-600 text-white rounded">Mark all as read</button>
            <button onClick={fetchNotifications} className="px-4 py-2 border rounded">Refresh</button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="text-center p-8">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-gray-600">No notifications</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n._id} className={`p-4 rounded border ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong>{n.title}</strong>
                      <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.read && (
                      <button onClick={() => markAsRead(n._id)} className="px-3 py-1 bg-green-600 text-white rounded">Mark read</button>
                    )}
                    <button onClick={() => remove(n._id)} className="px-3 py-1 border rounded text-sm">Delete</button>
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
