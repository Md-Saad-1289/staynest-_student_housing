import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export function ProfilePage() {
  const { user: authUser, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await userService.getProfile();
        const data = res?.data?.user || res?.data;
        if (mounted) setProfile(data);
      } catch (err) {
        if (err?.response?.status === 401) { logout(); navigate('/login'); }
      } finally { if (mounted) setLoading(false); }
    };

    if (authUser) { setProfile(authUser); setLoading(false); fetch(); }
    else fetch();
    return () => (mounted = false);
  }, [authUser, logout, navigate]);

  const startEdit = () => {
    const u = profile || {};
    setForm({
      name: u.name || '',
      email: u.email || '',
      mobile: u.mobile || u.phoneNo || '',
      fullAddress: u.fullAddress || '',
      dob: u.dob ? new Date(u.dob).toISOString().slice(0,10) : '',
      gender: u.gender || '',
      emergencyContact: u.emergencyContact || '',
      profileImage: u.profileImage || '',
      nidNumber: u.nidNumber || ''
    });
    setEditing(true); setError('');
  };

  const cancel = () => { setEditing(false); setError(''); };

  const validateUrl = (s) => { try { const u = new URL(s); return ['http:','https:'].includes(u.protocol); } catch { return false; } };

  const save = async () => {
    if (!form.name?.trim()) return setError('Name is required');
    if (form.mobile) {
      const digits = String(form.mobile).replace(/\D/g,''); if (digits.length < 8) return setError('Invalid mobile number');
    }

    const payload = {
      name: form.name.trim(),
      phoneNo: form.mobile || undefined,
      fullAddress: form.fullAddress || undefined,
      dob: form.dob || undefined,
      gender: form.gender || undefined,
      emergencyContact: form.emergencyContact || undefined,
    };

    if (form.profileImage && validateUrl(form.profileImage)) payload.profileImage = form.profileImage;
    if ((profile?.role === 'owner')) {
      if (!form.nidNumber && !profile?.nidNumber) { return setError('NID number required for owners'); }
      if (form.nidNumber) payload.nidNumber = form.nidNumber;
    }

    try {
      setSaving(true); setError('');
      const res = await userService.updateProfile(payload);
      const updated = res?.data?.user || res?.data;
      if (updated) { setProfile(updated); if (setUser) setUser(updated); }
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const user = profile || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {user.profileImage ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-gray-400 p-4">No Image</div>}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name || 'Profile'}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>
        </div>

        {!editing ? (
          <div>
            <div className="mb-4"><strong>Mobile:</strong> {user.mobile || user.phoneNo || '—'}</div>
            <div className="mb-4"><strong>Address:</strong> {user.fullAddress || '—'}</div>
            <div className="mb-4"><strong>DOB:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : '—'}</div>
            <div className="mb-4"><strong>Gender:</strong> {user.gender || '—'}</div>
            <div className="mb-4"><strong>Emergency Contact:</strong> {user.emergencyContact || '—'}</div>
            <div className="mb-4"><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</div>
            {user.role === 'owner' && <div className="mb-4"><strong>NID:</strong> {user.nidNumber || '—'}</div>}
            <div className="flex gap-2">
              <button onClick={startEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Edit Profile</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="border p-2 rounded" />
            <input value={form.email} disabled placeholder="Email (read-only)" className="border p-2 rounded bg-gray-100 text-gray-700" />
            <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="Mobile" className="border p-2 rounded" />
            <input value={form.fullAddress} onChange={e=>setForm({...form,fullAddress:e.target.value})} placeholder="Full address" className="border p-2 rounded" />
            <input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} className="border p-2 rounded" />
            <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="border p-2 rounded">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input value={form.emergencyContact} onChange={e=>setForm({...form,emergencyContact:e.target.value})} placeholder="Emergency contact (Name|Phone)" className="border p-2 rounded" />
            <input value={form.profileImage} onChange={e=>setForm({...form,profileImage:e.target.value})} placeholder="Profile image URL" className="border p-2 rounded" />
            {user.role === 'owner' && <input value={form.nidNumber} onChange={e=>setForm({...form,nidNumber:e.target.value})} placeholder="NID number" className="border p-2 rounded" />}
            {error && <div className="text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={cancel} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
