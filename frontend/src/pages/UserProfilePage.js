import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/api';

export const UserProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        setProfile(res.data);
        setFormData(res.data);
        setAvatarPreview(res.data.profileImage);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <i className="fas fa-user-circle text-blue-600"></i> My Profile
          </h1>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <i className={`fas ${message.includes('success') ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            {/* Avatar */}
            <div className="flex flex-col items-center -mt-24 mb-8">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-200 border-4 border-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
                    {profile?.name?.charAt(0) || 'U'}
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4">{profile?.name}</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <i className="fas fa-envelope"></i> {profile?.email}
              </p>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <i className="fas fa-phone"></i> {profile?.mobile}
              </p>
              <span className="mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                <i className="fas fa-tag mr-1"></i> {profile?.role}
              </span>
            </div>

            <hr className="my-8" />

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-user text-blue-600"></i> Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">{profile?.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-envelope text-purple-600"></i> Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">{profile?.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-phone text-green-600"></i> Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">{profile?.mobile}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-tag text-orange-600"></i> Role
                </label>
                <p className="text-gray-800 font-semibold capitalize">{profile?.role}</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-8">
              <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <i className={`fas fa-${profile?.isVerified ? 'check-circle' : 'clock'} text-green-600`}></i>
                {profile?.isVerified ? 'Account Verified' : 'Verification Pending'}
              </p>
              <p className="text-xs text-green-700">
                {profile?.isVerified
                  ? `Verified on ${new Date(profile?.verifiedAt).toLocaleDateString()}`
                  : 'Your account is pending verification. Please upload your NID or passport.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(profile);
                      setAvatarPreview(profile?.profileImage);
                    }}
                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-xmark"></i> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to logout?')) {
                        logout();
                      }
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Member since {new Date(profile?.createdAt).toLocaleDateString()} |
                Account ID: {profile?._id?.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
