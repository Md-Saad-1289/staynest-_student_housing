import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

function ProfilePage() {
  const { logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Fetch Profile ---------------- */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      const data = res?.data?.user || res?.data;
      setProfile(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ---------------- Edit ---------------- */
  const startEdit = () => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      fullAddress: profile.fullAddress || "",
      dob: profile.dob
        ? new Date(profile.dob).toISOString().slice(0, 10)
        : "",
      gender: profile.gender || "",
      emergencyContact: profile.emergencyContact || "",
      profileImage: profile.profileImage || "",
      nidNumber: profile.nidNumber || "",
    });

    setEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- Save ---------------- */
  const handleSave = async () => {
    if (!form.name?.trim()) {
      return setError("Full name is required.");
    }

    const payload = {
      name: form.name.trim(),
      fullAddress: form.fullAddress || undefined,
      dob: form.dob || undefined,
      gender: form.gender || undefined,
      emergencyContact: form.emergencyContact || undefined,
      profileImage: form.profileImage || undefined,
    };

    if (profile?.role === "owner" && form.nidNumber) {
      payload.nidNumber = form.nidNumber;
    }

    // small client-side validation for image URL
    if (form.profileImage) {
      try {
        new URL(form.profileImage);
      } catch (_e) {
        setError("Profile image must be a valid URL.");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const res = await userService.updateProfile(payload);
      const updatedUser = res?.data?.user || res?.data;

      setProfile(updatedUser);
      if (setUser) setUser(updatedUser);

      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const user = profile || {};

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-10">

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-50">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <span className="mt-2 inline-block text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full capitalize">
                {user.role}
              </span>
            </div>
          </div>

          {!editing && (
            <button
              onClick={startEdit}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          /* VIEW MODE */
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 text-sm text-gray-700">
            <Info label="Phone Number" value={user.phoneNo} locked />
            <Info label="Address" value={user.fullAddress} />
            <Info
              label="Date of Birth"
              value={
                user.dob
                  ? new Date(user.dob).toLocaleDateString()
                  : "—"
              }
            />
            <Info label="Gender" value={user.gender} />
            <Info label="Emergency Contact" value={user.emergencyContact} />
            <Info
              label="Verified"
              value={user.isVerified ? "Yes" : "No"}
            />
            {user.role === "owner" && (
              <Info label="NID Number" value={user.nidNumber} />
            )}
          </div>
        ) : (
          /* EDIT MODE */
          <div className="space-y-6 max-w-2xl">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
            />

            <ReadOnlyInput
              label="Email"
              value={user.email}
            />

            <ReadOnlyInput
              label="Phone Number"
              value={user.phoneNo}
            />

            <Input
              label="Address"
              value={form.fullAddress}
              onChange={(v) => handleChange("fullAddress", v)}
            />

            <Input
              label="Profile Image URL"
              value={form.profileImage}
              onChange={(v) => handleChange("profileImage", v)}
            />

            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={(v) => handleChange("dob", v)}
            />

            <Input
              label="Emergency Contact"
              value={form.emergencyContact}
              onChange={(v) =>
                handleChange("emergencyContact", v)
              }
            />

            {user.role === "owner" && (
              <Input
                label="NID Number"
                value={form.nidNumber}
                onChange={(v) =>
                  handleChange("nidNumber", v)
                }
              />
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Info({ label, value, locked }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-medium">
          {value || "—"}
        </p>
        {locked && (
          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
            Locked
          </span>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none transition"
      />
    </div>
  );
}

function ReadOnlyInput({ label, value }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        value={value || ""}
        disabled
        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
      />
    </div>
  );
}

// exports for both default and named imports
export default ProfilePage;
export { ProfilePage };