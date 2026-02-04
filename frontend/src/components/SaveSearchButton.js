import React, { useState, useContext } from 'react';
import { savedSearchService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const SaveSearchButton = ({ filters, onSaved }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!searchName.trim()) {
      setMessage('Please enter a name');
      return;
    }

    try {
      setSaving(true);
      await savedSearchService.createSavedSearch({
        name: searchName,
        filters,
        alertsEnabled: false,
      });
      setMessage('Search saved successfully!');
      setTimeout(() => {
        setShowModal(false);
        setSearchName('');
        setMessage('');
        if (onSaved) onSaved();
      }, 1500);
    } catch (err) {
      setMessage('Failed to save search');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition font-semibold"
      >
        <i className="fas fa-bookmark"></i> Save Search
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-bookmark text-purple-600"></i> Save This Search
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-tag text-purple-600"></i> Search Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Female Mess in Dhaka"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2 ${
                message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !searchName.trim()}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSearchName('');
                  setMessage('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveSearchButton;
