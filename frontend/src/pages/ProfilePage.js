import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userService, authService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export function ProfilePage() {
  const { user: authUser, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res?.data?.user || res?.data;

        if (mounted && data) setProfile(data);
      } catch (err) {
        if (err?.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (authUser) {
      setProfile(authUser);
      setLoading(false);
      fetchProfile();
    } else {
      fetchProfile();
    }

    return () => (mounted = false);
  }, [authUser]);

  /* ================= INIT FORM ================= */

  const initFormData = (u = {}) => ({
    name: u.name ?? "",
    mobile: u.mobile ?? "",
    bio: u.bio ?? "",
    university: u.university ?? "",
    location: u.location ?? "",
    linkedin: u.linkedin ?? "",
    twitter: u.twitter ?? "",
    website: u.website ?? "",
    budgetMin: typeof u.budgetMin === 'number' ? String(u.budgetMin) : (u.budgetMin ?? ""),
    budgetMax: typeof u.budgetMax === 'number' ? String(u.budgetMax) : (u.budgetMax ?? ""),
    gender: u.gender ?? "",
    // Academic
    dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().slice(0, 10) : "",
    studentId: u.studentId ?? "",
    major: u.major ?? "",
    academicYear: u.academicYear ?? "",
    // Address
    addressStreet: u.addressStreet ?? "",
    addressCity: u.addressCity ?? "",
    addressZipCode: u.addressZipCode ?? "",
    addressCountry: u.addressCountry ?? "",
    // Notifications & preferences
    emailNotifications: typeof u.emailNotifications !== 'undefined' ? !!u.emailNotifications : true,
    smsNotifications: typeof u.smsNotifications !== 'undefined' ? !!u.smsNotifications : true,
    pushNotifications: typeof u.pushNotifications !== 'undefined' ? !!u.pushNotifications : true,
    roommatePreferences: u.roommatePreferences ?? "",
    // Emergency contact
    emergencyContactName: u.emergencyContactName ?? "",
    emergencyContactPhone: u.emergencyContactPhone ?? "",
  });

  const startEditing = () => {
    setFormData(initFormData(profile || {}));
    setEditing(true);
    setMessage("");
  };

  const cancelEditing = () => {
    setEditing(false);
    // reset to profile values to avoid uncontrolled inputs
    setFormData(initFormData(profile || {}));
    setMessage("");
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      return setMessage("Full name is required");
    }

    if (formData.mobile) {
      const digits = formData.mobile.replace(/\D/g, "");
      if (digits.length < 8) {
        return setMessage("Invalid phone number");
      }
    }

    try {
      setSaving(true);
      // Build payload defensively: convert numbers and booleans, keep empty as '' so
      // backend can decide whether to update or skip the field.
      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile || undefined,
        bio: formData.bio || undefined,
        university: formData.university || undefined,
        location: formData.location || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        website: formData.website || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
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
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        gender: formData.gender || undefined,
        budgetMin: formData.budgetMin !== '' && formData.budgetMin != null ? formData.budgetMin : undefined,
        budgetMax: formData.budgetMax !== '' && formData.budgetMax != null ? formData.budgetMax : undefined,
      };

      const res = await userService.updateProfile(payload);
      const updated = res?.data?.user || res?.data;

      if (updated) {
        setProfile(updated);
        if (setUser) setUser(updated); // keep context synced
      }

      setMessage("Profile updated successfully ✅");
      setEditing(false);
    } catch (err) {
      setMessage(
        err?.response?.data?.error ||
          err?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  const user = profile || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {user.profileImage ? (
                <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name || 'Profile'}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div>
            {!editing ? (
              <button onClick={startEditing} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow">Edit Profile</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={cancelEditing} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE VIEW */}
        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="col-span-1 bg-gray-50 p-4 rounded border">
              <p className="text-xs text-gray-500">Contact</p>
              <p className="mt-2 text-gray-800">{user.mobile || '—'}</p>
              <p className="mt-1 text-gray-600 text-sm">{user.location || '—'}</p>
            </div>
            <div className="col-span-1 bg-gray-50 p-4 rounded border">
              <p className="text-xs text-gray-500">Academic</p>
              <p className="mt-2 text-gray-800">{user.university || '—'}</p>
              <p className="text-gray-600 text-sm">{user.major || '—'}</p>
              <p className="text-xs text-gray-500 mt-2">Year: {user.academicYear || '—'}</p>
            </div>
            <div className="col-span-1 bg-gray-50 p-4 rounded border">
              <p className="text-xs text-gray-500">Preferences</p>
              <p className="mt-2 text-gray-800">Budget: {user.budgetMin ?? '—'} — {user.budgetMax ?? '—'}</p>
              <p className="text-gray-800">Roommate: {user.roommatePreferences ?? '—'}</p>
              <p className="text-gray-800">Gender: {user.gender ?? '—'}</p>
            </div>

            <div className="col-span-2 bg-gray-50 p-4 rounded border">
              <p className="text-xs text-gray-500">About</p>
              <p className="mt-2 text-gray-800">{user.bio || '—'}</p>
              <div className="mt-3 text-sm text-blue-600">
                {user.linkedin && <div><a href={user.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div>}
                {user.twitter && <div><a href={user.twitter} target="_blank" rel="noreferrer">Twitter</a></div>}
                {user.website && <div><a href={user.website} target="_blank" rel="noreferrer">Website</a></div>}
              </div>
            </div>

            <div className="col-span-1 bg-gray-50 p-4 rounded border">
              <p className="text-xs text-gray-500">Emergency Contact</p>
              <p className="mt-2 text-gray-800">{user.emergencyContactName ? `${user.emergencyContactName} (${user.emergencyContactPhone || '—'})` : '—'}</p>
              <p className="text-xs text-gray-500 mt-3">Notifications</p>
              <p className="mt-1 text-gray-800">Email: {user.emailNotifications ? 'Yes' : 'No'}</p>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="grid gap-3">
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Full Name"
              className="border p-2 rounded"
            />
            <input
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              placeholder="Phone"
              className="border p-2 rounded"
            />
            <input
              value={formData.university}
              onChange={(e) =>
                setFormData({ ...formData, university: e.target.value })
              }
              placeholder="University"
              className="border p-2 rounded"
            />
            <input
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="Major"
              className="border p-2 rounded"
            />
            <input
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="Academic Year"
              className="border p-2 rounded"
            />
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              value={formData.addressStreet}
              onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
              placeholder="Street Address"
              className="border p-2 rounded"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={formData.addressCity}
                onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                placeholder="City"
                className="border p-2 rounded"
              />
              <input
                value={formData.addressZipCode}
                onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                placeholder="ZIP / Postal Code"
                className="border p-2 rounded"
              />
              <input
                value={formData.addressCountry}
                onChange={(e) => setFormData({ ...formData, addressCountry: e.target.value })}
                placeholder="Country"
                className="border p-2 rounded"
              />
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Bio"
              className="border p-2 rounded"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="LinkedIn URL"
                className="border p-2 rounded"
              />
              <input
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="Twitter URL"
                className="border p-2 rounded"
              />
              <input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Website"
                className="border p-2 rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                placeholder="Budget Min"
                className="border p-2 rounded"
              />
              <input
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                placeholder="Budget Max"
                className="border p-2 rounded"
              />
              <input
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                placeholder="Gender"
                className="border p-2 rounded"
              />
            </div>
            <input
              value={formData.roommatePreferences}
              onChange={(e) => setFormData({ ...formData, roommatePreferences: e.target.value })}
              placeholder="Roommate preferences"
              className="border p-2 rounded"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.emailNotifications} onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })} /> Email</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.smsNotifications} onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })} /> SMS</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.pushNotifications} onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })} /> Push</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Emergency contact name"
                className="border p-2 rounded"
              />
              <input
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="Emergency contact phone"
                className="border p-2 rounded"
              />
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div className="mt-6 text-sm font-medium text-indigo-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;