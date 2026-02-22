import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/api';

export const UserProfilePage = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const initFormData = (d = {}) => ({
    name: d.name ?? '',
    phoneNo: d.phoneNo ?? d.mobile ?? '',
    bio: d.bio ?? '',
    university: d.university ?? '',
    location: d.location ?? '',
    linkedin: d.linkedin ?? '',
    twitter: d.twitter ?? '',
    website: d.website ?? '',
    budgetMin: typeof d.budgetMin === 'number' ? String(d.budgetMin) : (d.budgetMin ?? ''),
    budgetMax: typeof d.budgetMax === 'number' ? String(d.budgetMax) : (d.budgetMax ?? ''),
    gender: d.gender ?? '',
    dob: d.dob ? new Date(d.dob).toISOString().slice(0,10) : (d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().slice(0,10) : ''),
    studentId: d.studentId ?? '',
    major: d.major ?? '',
    academicYear: d.academicYear ?? '',
    addressStreet: d.addressStreet ?? '',
    addressCity: d.addressCity ?? '',
    addressZipCode: d.addressZipCode ?? '',
    addressCountry: d.addressCountry ?? '',
    emailNotifications: typeof d.emailNotifications !== 'undefined' ? !!d.emailNotifications : true,
    smsNotifications: typeof d.smsNotifications !== 'undefined' ? !!d.smsNotifications : true,
    pushNotifications: typeof d.pushNotifications !== 'undefined' ? !!d.pushNotifications : true,
    roommatePreferences: d.roommatePreferences ?? '',
    emergencyContactName: d.emergencyContactName ?? '',
    emergencyContactPhone: d.emergencyContactPhone ?? '',
    profileImage: d.profileImage ?? null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res?.data?.user || res?.data || null;
        setProfile(data);
        setFormData(initFormData(data || {}));
        setAvatarPreview(data?.profileImage || null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // file uploads disabled — profileImage must be a valid http(s) URL
  const handleAvatarChange = () => {};

  const handleSaveProfile = async () => {
    // client-side validation
    const validation = validateProfile();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        phoneNo: formData.phoneNo || undefined,
        bio: formData.bio || undefined,
        university: formData.university || undefined,
        location: formData.location || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        website: formData.website || undefined,
        dob: formData.dob || formData.dateOfBirth || undefined,
        studentId: formData.studentId || undefined,
        major: formData.major || undefined,
        academicYear: formData.academicYear || undefined,
        addressStreet: formData.addressStreet || undefined,
        addressCity: formData.addressCity || undefined,
        addressZipCode: formData.addressZipCode || undefined,
        addressCountry: formData.addressCountry || undefined,
        emailNotifications: !!formData.emailNotifications,
        smsNotifications: !!formData.smsNotifications,
        pushNotifications: !!formData.pushNotifications,
        roommatePreferences: formData.roommatePreferences || undefined,
        // combine emergency contact name/phone into single stored string
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? `${formData.emergencyContactName || ''}|${formData.emergencyContactPhone || ''}` : undefined,
        gender: formData.gender || undefined,
        // only accept http(s) URLs for profileImage
        profileImage: (formData.profileImage && (() => { try { const u = new URL(formData.profileImage); return ['http:','https:'].includes(u.protocol); } catch { return false; } })()) ? formData.profileImage : undefined,
        budgetMin: formData.budgetMin !== '' && formData.budgetMin != null ? formData.budgetMin : undefined,
        budgetMax: formData.budgetMax !== '' && formData.budgetMax != null ? formData.budgetMax : undefined,
      };

      const res = await userService.updateProfile(payload);
      const updated = res?.data?.user || res?.data || payload;
      setProfile(updated);
      setFormData(initFormData(updated));
      setAvatarPreview(updated?.profileImage || null);
      if (setUser) setUser(updated);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      const serverMsg = err?.response?.data?.error || err?.message || 'Failed to update profile';
      setMessage(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  const validateProfile = () => {
    const e = {};
    const name = (formData.name || '').trim();
    const phone = (formData.phoneNo || '').trim();

    if (!name) e.name = 'Full name is required';
    if (phone) {
      const digits = phone.replace(/[^0-9]/g, '');
      if (digits.length < 8) e.phoneNo = 'Enter a valid phone number';
    } else {
      e.phoneNo = 'Phone number is required';
    }
    return e;
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
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-default" title="Edit profile image via URL in the form below">
                    <i className="fas fa-camera"></i>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4">{profile?.name}</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <i className="fas fa-envelope"></i> {profile?.email}
              </p>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <i className="fas fa-phone"></i> {profile?.phoneNo}
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
                {editing && errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-envelope text-purple-600"></i> Email
                </label>
                <p className="text-gray-800 font-semibold">{profile?.email}</p>
                {editing && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-phone text-green-600"></i> Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phoneNo || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 01712345678"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">{profile?.phoneNo}</p>
                )}
                {editing && errors.phoneNo && <p className="text-xs text-red-600 mt-1">{errors.phoneNo}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-tag text-orange-600"></i> Role
                </label>
                <p className="text-gray-800 font-semibold capitalize">{profile?.role}</p>
              </div>
            </div>

            {/* Extended Profile Fields */}
            {editing ? (
              <div className="mb-6 grid grid-cols-1 gap-4">
                <input
                  value={formData.profileImage || ''}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="Profile image URL (http/https)"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="University"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Location"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="Twitter URL"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Website"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Major"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="Student ID"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="Academic Year"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.roommatePreferences}
                    onChange={(e) => setFormData({ ...formData, roommatePreferences: e.target.value })}
                    placeholder="Roommate preferences"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={formData.addressStreet}
                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                    placeholder="Street Address"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    placeholder="City"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.addressZipCode}
                    onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                    placeholder="ZIP / Postal Code"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={formData.addressCountry}
                    onChange={(e) => setFormData({ ...formData, addressCountry: e.target.value })}
                    placeholder="Country"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    placeholder="Budget Min"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    placeholder="Budget Max"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.emailNotifications} onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })} /> Email notifications</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.smsNotifications} onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })} /> SMS</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.pushNotifications} onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })} /> Push</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Emergency contact name"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="Emergency contact phone"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                {/* Bio */}
                {profile?.bio && (
                  <div className="text-gray-800">
                    <h4 className="font-semibold text-gray-700">About</h4>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}

                {/* Academic & Work */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  {profile?.university && <div><strong>University:</strong> {profile.university}</div>}
                  {profile?.major && <div><strong>Major:</strong> {profile.major}</div>}
                  {profile?.academicYear && <div><strong>Academic Year:</strong> {profile.academicYear}</div>}
                  {profile?.studentId && <div><strong>Student ID:</strong> {profile.studentId}</div>}
                  { (profile?.dob || profile?.dateOfBirth) && <div><strong>DOB:</strong> {new Date(profile.dob || profile.dateOfBirth).toLocaleDateString()}</div> }
                </div>

                {/* Socials */}
                {(profile?.linkedin || profile?.twitter || profile?.website) && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Social</h4>
                    <div className="mt-1 text-sm text-blue-600 space-y-1">
                      {profile.linkedin && <div>LinkedIn: <a href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedin}</a></div>}
                      {profile.twitter && <div>Twitter: <a href={profile.twitter} target="_blank" rel="noreferrer">{profile.twitter}</a></div>}
                      {profile.website && <div>Website: <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a></div>}
                    </div>
                  </div>
                )}

                {/* Address */}
                {(profile?.addressStreet || profile?.addressCity || profile?.addressZipCode || profile?.addressCountry) && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Address</h4>
                    <p className="mt-1 text-sm text-gray-700">
                      {profile.addressStreet ? profile.addressStreet + ', ' : ''}
                      {profile.addressCity ? profile.addressCity + ', ' : ''}
                      {profile.addressZipCode ? profile.addressZipCode + ', ' : ''}
                      {profile.addressCountry || ''}
                    </p>
                  </div>
                )}

                {/* Preferences & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div><strong>Budget:</strong> {profile.budgetMin ?? '—'} - {profile.budgetMax ?? '—'}</div>
                  <div><strong>Roommate Preferences:</strong> {profile.roommatePreferences ?? '—'}</div>
                </div>

                {/* Gender & Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div><strong>Gender:</strong> {profile.gender ?? '—'}</div>
                  <div><strong>Notifications:</strong> Email: {profile.emailNotifications ? 'Yes' : 'No'}, SMS: {profile.smsNotifications ? 'Yes' : 'No'}, Push: {profile.pushNotifications ? 'Yes' : 'No'}</div>
                </div>

                {/* Emergency Contact */}
                <div className="text-sm text-gray-700">
                  <strong>Emergency Contact:</strong> {profile.emergencyContactName ? `${profile.emergencyContactName} (${profile.emergencyContactPhone || '—'})` : '—'}
                </div>

                {/* Verification */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 text-sm">
                  <p className="font-semibold text-green-900 flex items-center gap-2">
                    <i className={`fas fa-${profile?.isVerified ? 'check-circle' : 'clock'} text-green-600`}></i>
                    {profile?.isVerified ? 'Account Verified' : 'Verification Pending'}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {profile?.isVerified
                      ? `Verified on ${new Date(profile?.verifiedAt).toLocaleDateString()}`
                      : 'Your account is pending verification. Please upload your NID or passport.'}
                  </p>
                </div>
              </div>
            )}

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
                      setFormData(initFormData(profile || {}));
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
                    onClick={() => {
                      setEditing(true);
                      setFormData(initFormData(profile || {}));
                    }}
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
