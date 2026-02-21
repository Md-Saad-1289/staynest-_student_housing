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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Profile</h2>

          {!editing ? (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* PROFILE VIEW */}
        {!editing ? (
          <div className="space-y-3 text-sm">
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.mobile}</div>
            <div><strong>University:</strong> {user.university}</div>
            <div><strong>Major:</strong> {user.major}</div>
            <div><strong>Academic Year:</strong> {user.academicYear}</div>
            <div><strong>Location:</strong> {user.location}</div>
            <div><strong>Address:</strong> {user.addressStreet || ''}{user.addressCity ? ', ' + user.addressCity : ''}{user.addressZipCode ? ', ' + user.addressZipCode : ''}{user.addressCountry ? ', ' + user.addressCountry : ''}</div>
            <div><strong>Bio:</strong> {user.bio}</div>
            <div><strong>Social:</strong> {user.linkedin || user.twitter || user.website ? (
              <div className="space-y-1">
                {user.linkedin && <div>LinkedIn: <a className="text-blue-600" href={user.linkedin}>{user.linkedin}</a></div>}
                {user.twitter && <div>Twitter: <a className="text-blue-600" href={user.twitter}>{user.twitter}</a></div>}
                {user.website && <div>Website: <a className="text-blue-600" href={user.website}>{user.website}</a></div>}
              </div>
            ) : '—'}</div>
            <div><strong>Budget:</strong> {user.budgetMin ?? '—'} - {user.budgetMax ?? '—'}</div>
            <div><strong>Roommate Preferences:</strong> {user.roommatePreferences ?? '—'}</div>
            <div><strong>Gender:</strong> {user.gender ?? '—'}</div>
            <div><strong>Notifications:</strong> Email: {user.emailNotifications ? 'Yes' : 'No'}, SMS: {user.smsNotifications ? 'Yes' : 'No'}, Push: {user.pushNotifications ? 'Yes' : 'No'}</div>
            <div><strong>Emergency Contact:</strong> {user.emergencyContactName ? `${user.emergencyContactName} (${user.emergencyContactPhone || '—'})` : '—'}</div>
            <div><strong>Date of Birth:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '—'}</div>
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