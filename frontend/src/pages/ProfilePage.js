import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const { logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= Fetch Profile ================= */

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

  /* ================= Handlers ================= */

  const startEdit = () => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      email: profile.email || "",
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

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

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
    };

    if (form.profileImage && isValidUrl(form.profileImage)) {
      payload.profileImage = form.profileImage;
    }

    if (profile?.role === "owner" && form.nidNumber) {
      payload.nidNumber = form.nidNumber;
    }

    try {
      setSaving(true);
      setError("");

      const res = await userService.updateProfile(payload);
      const updatedUser = res?.data?.user || res?.data;

      setProfile(updatedUser);
      setUser?.(updatedUser);

      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= Loading ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 animate-pulse text-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  const user = profile || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No Image
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              {user.name || "User Profile"}
            </h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full mt-2 inline-block">
              {user.role}
            </span>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
              <InfoRow label="Phone" value={user.phoneNo} />
              <InfoRow label="Address" value={user.fullAddress} />
              <InfoRow
                label="Date of Birth"
                value={
                  user.dob
                    ? new Date(user.dob).toLocaleDateString()
                    : "—"
                }
              />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow
                label="Emergency Contact"
                value={user.emergencyContact}
              />
              {user.role === "owner" && (
                <InfoRow label="NID Number" value={user.nidNumber} />
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={startEdit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-sm"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">

              <Input label="Full Name" value={form.name}
                onChange={(v)=>handleChange("name",v)} />

              <Input label="Email" value={form.email} disabled />

              <Input label="Phone" value={form.phoneNo} disabled />

              <Input label="Address" value={form.fullAddress}
                onChange={(v)=>handleChange("fullAddress",v)} />

              <Input type="date" label="Date of Birth"
                value={form.dob}
                onChange={(v)=>handleChange("dob",v)} />

              <Select
                label="Gender"
                value={form.gender}
                onChange={(v)=>handleChange("gender",v)}
                options={[
                  { value: "", label: "Prefer not to say" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" }
                ]}
              />

              <Input
                label="Emergency Contact"
                value={form.emergencyContact}
                onChange={(v)=>handleChange("emergencyContact",v)}
              />

              <Input
                label="Profile Image URL"
                value={form.profileImage}
                onChange={(v)=>handleChange("profileImage",v)}
              />

              {user.role === "owner" && (
                <Input
                  label="NID Number"
                  value={form.nidNumber}
                  onChange={(v)=>handleChange("nidNumber",v)}
                />
              )}
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-6 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= Reusable UI ================= */

function InfoRow({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <p className="text-xs uppercase text-slate-500 mb-1 tracking-wide">
        {label}
      </p>
      <p className="font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function Input({ label, value, onChange, type="text", disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-600">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e)=>onChange?.(e.target.value)}
        className={`w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none ${
          disabled ? "bg-slate-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-600">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {options.map((opt)=>(
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}