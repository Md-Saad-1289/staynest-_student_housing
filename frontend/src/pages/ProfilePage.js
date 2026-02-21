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

  const initFormData = (u) => ({
    name: u.name || "",
    mobile: u.mobile || "",
    bio: u.bio || "",
    university: u.university || "",
    location: u.location || "",
    linkedin: u.linkedin || "",
    twitter: u.twitter || "",
    website: u.website || "",
    budgetMin: u.budgetMin || "",
    budgetMax: u.budgetMax || "",
    gender: u.gender || "",
  });

  const startEditing = () => {
    setFormData(initFormData(profile));
    setEditing(true);
    setMessage("");
  };

  const cancelEditing = () => {
    setEditing(false);
    setFormData({});
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

      const payload = {
        ...formData,
        name: formData.name.trim(),
        budgetMin: formData.budgetMin
          ? parseFloat(formData.budgetMin)
          : null,
        budgetMax: formData.budgetMax
          ? parseFloat(formData.budgetMax)
          : null,
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
            <div><strong>Location:</strong> {user.location}</div>
            <div><strong>Bio:</strong> {user.bio}</div>
            <div><strong>Budget:</strong> {user.budgetMin} - {user.budgetMax}</div>
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
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Bio"
              className="border p-2 rounded"
            />
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