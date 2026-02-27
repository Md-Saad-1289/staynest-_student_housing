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
      phoneNo: profile.phoneNo || "",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const user = profile || {};
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const completionPercentage = Math.round(
    (Object.keys(user).filter(
      (k) =>
        ["name", "email", "fullAddress", "dob", "gender", "emergencyContact"].includes(k) &&
        user[k]
    ).length /
      6) *
      100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card with Avatar */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700"></div>

          <div className="px-6 md:px-10 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4 mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-blue-600 font-medium text-sm">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">
                      {user.role}
                    </span>
                    {user.isVerified && (
                      <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!editing && (
                <button
                  onClick={startEdit}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  ✎ Edit Profile
                </button>
              )}
            </div>

            {/* Completion Bar */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Profile Completion</p>
                <p className="text-sm font-bold text-blue-600">{completionPercentage}%</p>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {!editing ? (
          /* VIEW MODE */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span> Personal Information
              </h2>
              <div className="space-y-4">
                <InfoCard label="Phone Number" value={user.phoneNo} locked />
                <InfoCard
                  label="Date of Birth"
                  value={
                    user.dob
                      ? new Date(user.dob).toLocaleDateString()
                      : "Not provided"
                  }
                />
                <InfoCard label="Gender" value={user.gender || "Not provided"} />
              </div>
            </div>

            {/* Contact & Verification */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📍</span> Additional Info
              </h2>
              <div className="space-y-4">
                <InfoCard label="Address" value={user.fullAddress || "Not provided"} />
                <InfoCard label="Emergency Contact" value={user.emergencyContact || "Not provided"} />
                {user.role === "owner" && (
                  <InfoCard label="NID Number" value={user.nidNumber || "Not provided"} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Your Profile</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                required
              />

              <ReadOnlyInput label="Email" value={user.email} />

              <Input
                label="Phone Number"
                type="tel"
                value={form.phoneNo || user.phoneNo}
                onChange={(v) => handleChange("phoneNo", v)}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={form.dob}
                onChange={(v) => handleChange("dob", v)}
              />

              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={form.fullAddress}
                  onChange={(v) => handleChange("fullAddress", v)}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Profile Image URL"
                  value={form.profileImage}
                  onChange={(v) => handleChange("profileImage", v)}
                  placeholder="https://example.com/image.jpg"
                />
                {form.profileImage && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-2">Preview:</p>
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-blue-300">
                      <img
                        src={form.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Emergency Contact"
                value={form.emergencyContact}
                onChange={(v) => handleChange("emergencyContact", v)}
              />

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={form.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {user.role === "owner" && (
                <Input
                  label="NID Number"
                  value={form.nidNumber}
                  onChange={(v) => handleChange("nidNumber", v)}
                />
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {saving ? "💾 Saving..." : "✓ Save Changes"}
              </button>

              <button
                onClick={cancelEdit}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function InfoCard({ label, value, locked }) {
  return (
    <div className="flex items-start justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 font-medium mt-1">{value || "—"}</p>
      </div>
      {locked && (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-semibold">
          🔒 Locked
        </span>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white hover:border-gray-400"
      />
    </div>
  );
}

function ReadOnlyInput({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-medium cursor-not-allowed flex items-center">
        <span>{value || "—"}</span>
        <span className="ml-auto text-gray-400">🔒</span>
      </div>
    </div>
  );
}

// exports for both default and named imports
export default ProfilePage;
export { ProfilePage };