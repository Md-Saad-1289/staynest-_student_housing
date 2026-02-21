import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, authService } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const Badge = ({ children, color = 'bg-white border border-gray-200 text-gray-700' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${color}`}>{children}</span>
)

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {icon && <div className="text-slate-400 w-5 h-5 flex items-center justify-center">{icon}</div>}
      <div className="text-sm text-gray-500">{label}</div>
    </div>
    <div className="text-sm text-gray-800 font-medium">{value}</div>
  </div>
)

export function ProfilePage() {
  const { user: authUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
    const [showDebug, setShowDebug] = useState(false)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [changingPwd, setChangingPwd] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile()
        // API returns { user: { ... } }
        let data = res?.data?.user || res?.data || null
        // fallback to authService.getCurrentUser if shape differs
        if ((!data || Object.keys(data).length === 0) && authService) {
          try {
            const r2 = await authService.getCurrentUser()
            data = r2?.data?.user || r2?.data || data
          } catch (e) {
            console.debug('authService.getCurrentUser fallback failed', e)
          }
        }
        if (mounted && data) setProfile(data)
      } catch (err) {
        console.error('Failed to load profile:', err)
        // If unauthorized, force logout and redirect to login
        if (err?.response?.status === 401) {
          try {
            logout()
          } catch (e) {
            console.debug('logout failed', e)
          }
          if (mounted) navigate('/login')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // If we already have context user, show it immediately, then try
    // to fetch the full profile to enrich missing fields (so login/register updates reflect instantly).
    if (authUser) {
      if (mounted) {
        setProfile(authUser)
        setLoading(false)
      }
      // fetch full profile in background to populate additional fields
      fetchProfile()
    } else {
      fetchProfile()
    }

    return () => {
      mounted = false
    }
  }, [authUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <p className="text-gray-600 mt-3">Loading profile...</p>
        </div>
      </div>
    )
  }

  const user = profile || {}

  // Fallbacks and formatting
  const fullName = user.name || user.fullName || 'Your Name'
  const role = user.role || 'User'
  const verified = user.isVerified || user.verified || false
  const bio = user.bio || ''
  const email = user.email || ''
  const phone = user.mobile || user.phone || ''
  const university = user.university || ''
  const location = user.location || ''
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : (user.memberSince || '')
  const lastLogin = user.lastLogin || ''
  const completion = user.completion || 0
  const avatar = user.profileImage || user.avatar || 'https://images.unsplash.com/photo-1545996124-3a4f8b0a3a8b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=8b6f3e1b3c'

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="h-44 bg-gradient-to-r from-white via-white/30 to-white/10" style={{ backgroundImage: 'linear-gradient(90deg,#eef2ff 0%, #eef6ff 50%, #f8fafc 100%)' }}></div>

          {/* Avatar and main card */}
          <div className="-mt-20 px-6 pb-6">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                <div className="flex-none -mt-20 md:mt-0">
                  <div className="w-36 h-36 rounded-full ring-6 ring-white overflow-hidden shadow-2xl">
                    <img src={(editing && formData.profileImage) ? formData.profileImage : avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex-1 mt-6 md:mt-0">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">{fullName}</h1>
                    <Badge className="flex-shrink-0">{role}</Badge>
                    {verified && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="bg-blue-50 text-blue-600 rounded-full p-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-700">Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 max-w-2xl leading-relaxed">{bio}</p>

                  <div className="mt-5 w-full md:w-2/3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">Profile completion</div>
                      <div className="text-xs text-gray-500">{completion}%</div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:flex-none ml-auto">
                  <div className="flex items-center gap-3">
                      {!editing ? (
                        <>
                          <button onClick={() => { 
                            setEditing(true); 
                            setFormData({ 
                              name: fullName, 
                              mobile: phone, 
                              bio, 
                              university, 
                              location, 
                              linkedin: user.linkedin || '', 
                              twitter: user.twitter || '', 
                              website: user.website || '',
                              dateOfBirth: user.dateOfBirth || '',
                              studentId: user.studentId || '',
                              major: user.major || '',
                              academicYear: user.academicYear || '',
                              addressStreet: user.addressStreet || '',
                              addressCity: user.addressCity || '',
                              addressZipCode: user.addressZipCode || '',
                              addressCountry: user.addressCountry || '',
                              emailNotifications: user.emailNotifications !== false,
                              smsNotifications: user.smsNotifications !== false,
                              pushNotifications: user.pushNotifications !== false,
                              budgetMin: user.budgetMin || '',
                              budgetMax: user.budgetMax || '',
                              roommatePreferences: user.roommatePreferences || '',
                              gender: user.gender || '',
                              emergencyContactName: user.emergencyContactName || '',
                              emergencyContactPhone: user.emergencyContactPhone || ''
                            }); 
                            setMessage('') 
                          }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow hover:opacity-95 transition">Edit profile</button>
                          <button className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm">Settings</button>
                        </>
                      ) : (
                        <>
                          <button onClick={async () => {
                            try {
                              setSaving(true)
                              // Validate required fields
                              if (!formData.name || !formData.name.trim()) {
                                setMessage('Full name is required')
                                setSaving(false)
                                return
                              }
                              if (formData.mobile) {
                                const digits = formData.mobile.replace(/[^0-9]/g, '')
                                if (digits.length < 8) {
                                  setMessage('Phone number must have at least 8 digits')
                                  setSaving(false)
                                  return
                                }
                              }
                              const payload = { 
                                name: formData.name.trim(), 
                                mobile: formData.mobile || '', 
                                profileImage: formData.profileImage, 
                                bio: formData.bio || '', 
                                university: formData.university || '', 
                                location: formData.location || '',
                                linkedin: formData.linkedin || '',
                                twitter: formData.twitter || '',
                                website: formData.website || '',
                                // New fields
                                dateOfBirth: formData.dateOfBirth || null,
                                studentId: formData.studentId || '',
                                major: formData.major || '',
                                academicYear: formData.academicYear || '',
                                addressStreet: formData.addressStreet || '',
                                addressCity: formData.addressCity || '',
                                addressZipCode: formData.addressZipCode || '',
                                addressCountry: formData.addressCountry || '',
                                emailNotifications: formData.emailNotifications !== false,
                                smsNotifications: formData.smsNotifications !== false,
                                pushNotifications: formData.pushNotifications !== false,
                                budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
                                budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
                                roommatePreferences: formData.roommatePreferences || '',
                                gender: formData.gender || '',
                                emergencyContactName: formData.emergencyContactName || '',
                                emergencyContactPhone: formData.emergencyContactPhone || ''
                              }
                              const res = await userService.updateProfile(payload)
                              const updated = res?.data?.user || res?.data || null
                              if (updated) {
                                setProfile(updated)
                                setFormData({})
                              }
                              setMessage('Profile saved')
                              setEditing(false)
                            } catch (err) {
                              console.error('Save failed', err)
                              const errorMsg = err?.response?.data?.error || err?.message || 'Failed to save profile'
                              setMessage(errorMsg)
                            } finally {
                              setSaving(false)
                              setTimeout(() => setMessage(''), 3000)
                            }
                          }} disabled={saving} className="px-4 py-2 rounded-md bg-green-600 text-white">{saving ? 'Saving...' : 'Save'}</button>
                          <button onClick={() => { setEditing(false); setFormData({}); setMessage(''); }} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm">Cancel</button>
                        </>
                      )}
                      <button onClick={() => setShowDebug(s => !s)} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm">Debug</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-sm text-gray-800 font-medium">{email || '—'}</div>
              </div>

              {!editing ? (
                <>
                  <InfoRow
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5A2.5 2.5 0 015.5 3h2A2.5 2.5 0 0110 5.5V7h4v1H4V5.5zM4 10h16v8.5A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5V10z"/></svg>}
                    label="Phone"
                    value={phone || '—'}
                  />
                  {university && (
                    <InfoRow
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z"/></svg>}
                      label="University"
                      value={university}
                    />
                  )}
                  {location && (
                    <InfoRow
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/></svg>}
                      label="Location"
                      value={location}
                    />
                  )}
                  {bio && (
                    <InfoRow label="Bio" value={bio} />
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Avatar</label>
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files && e.target.files[0]
                        if (!file) return
                        try {
                          const dataUrl = await (new Promise((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = () => resolve(reader.result)
                            reader.onerror = reject
                            reader.readAsDataURL(file)
                          }))

                          // create image to crop center-square
                          const img = document.createElement('img')
                          img.src = dataUrl
                          await new Promise((res) => { img.onload = res })
                          const size = Math.min(img.naturalWidth, img.naturalHeight)
                          const sx = (img.naturalWidth - size) / 2
                          const sy = (img.naturalHeight - size) / 2
                          const canvas = document.createElement('canvas')
                          const target = 400
                          canvas.width = target
                          canvas.height = target
                          const ctx = canvas.getContext('2d')
                          ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target)
                          const cropped = canvas.toDataURL('image/jpeg', 0.9)
                          setFormData(fd => ({ ...fd, profileImage: cropped }))
                        } catch (err) {
                          console.error('Avatar processing failed', err)
                        }
                      }} className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Full name</label>
                      <input value={formData.name || ''} onChange={(e) => setFormData(fd => ({ ...fd, name: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone</label>
                      <input value={formData.mobile || ''} onChange={(e) => setFormData(fd => ({ ...fd, mobile: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">University</label>
                      <input value={formData.university || ''} onChange={(e) => setFormData(fd => ({ ...fd, university: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Location</label>
                      <input value={formData.location || ''} onChange={(e) => setFormData(fd => ({ ...fd, location: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Bio</label>
                      <textarea value={formData.bio || ''} onChange={(e) => setFormData(fd => ({ ...fd, bio: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Social links (optional)</label>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={formData.linkedin || ''} onChange={(e) => setFormData(fd => ({ ...fd, linkedin: e.target.value }))} placeholder="LinkedIn URL" className="w-full border rounded px-3 py-2 text-sm" />
                        <input value={formData.twitter || ''} onChange={(e) => setFormData(fd => ({ ...fd, twitter: e.target.value }))} placeholder="Twitter URL" className="w-full border rounded px-3 py-2 text-sm" />
                        <input value={formData.website || ''} onChange={(e) => setFormData(fd => ({ ...fd, website: e.target.value }))} placeholder="Website" className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-3">Academic Information</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                          <input type="date" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={(e) => setFormData(fd => ({ ...fd, dateOfBirth: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Student ID</label>
                          <input value={formData.studentId || ''} onChange={(e) => setFormData(fd => ({ ...fd, studentId: e.target.value }))} placeholder="e.g., CSE-2021-001" className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Major/Field</label>
                          <input value={formData.major || ''} onChange={(e) => setFormData(fd => ({ ...fd, major: e.target.value }))} placeholder="e.g., Computer Science" className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Academic Year</label>
                          <select value={formData.academicYear || ''} onChange={(e) => setFormData(fd => ({ ...fd, academicYear: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                            <option value="">Select year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Masters">Masters</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-3">Address Information</label>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={formData.addressStreet || ''} onChange={(e) => setFormData(fd => ({ ...fd, addressStreet: e.target.value }))} placeholder="Street Address" className="w-full border rounded px-3 py-2 text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={formData.addressCity || ''} onChange={(e) => setFormData(fd => ({ ...fd, addressCity: e.target.value }))} placeholder="City" className="w-full border rounded px-3 py-2 text-sm" />
                          <input value={formData.addressZipCode || ''} onChange={(e) => setFormData(fd => ({ ...fd, addressZipCode: e.target.value }))} placeholder="Zip Code" className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <input value={formData.addressCountry || ''} onChange={(e) => setFormData(fd => ({ ...fd, addressCountry: e.target.value }))} placeholder="Country" className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    {/* User Preferences */}
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-3">Preferences</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Gender</label>
                          <select value={formData.gender || ''} onChange={(e) => setFormData(fd => ({ ...fd, gender: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Budget Min (৳)</label>
                          <input type="number" value={formData.budgetMin || ''} onChange={(e) => setFormData(fd => ({ ...fd, budgetMin: e.target.value }))} placeholder="Min rent" className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Budget Max (৳)</label>
                          <input type="number" value={formData.budgetMax || ''} onChange={(e) => setFormData(fd => ({ ...fd, budgetMax: e.target.value }))} placeholder="Max rent" className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 mb-1">Roommate Preferences</label>
                        <textarea value={formData.roommatePreferences || ''} onChange={(e) => setFormData(fd => ({ ...fd, roommatePreferences: e.target.value }))} placeholder="e.g., Quiet, Non-smoker, Early riser" className="w-full border rounded px-3 py-2 text-sm" rows={2} />
                      </div>
                    </div>

                    {/* Contact Preferences */}
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-3">Contact Preferences</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={formData.emailNotifications !== false} onChange={(e) => setFormData(fd => ({ ...fd, emailNotifications: e.target.checked }))} className="rounded" />
                          <span>Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={formData.smsNotifications !== false} onChange={(e) => setFormData(fd => ({ ...fd, smsNotifications: e.target.checked }))} className="rounded" />
                          <span>SMS Notifications</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={formData.pushNotifications !== false} onChange={(e) => setFormData(fd => ({ ...fd, pushNotifications: e.target.checked }))} className="rounded" />
                          <span>Push Notifications</span>
                        </label>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-3">Emergency Contact</label>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={formData.emergencyContactName || ''} onChange={(e) => setFormData(fd => ({ ...fd, emergencyContactName: e.target.value }))} placeholder="Contact Name" className="w-full border rounded px-3 py-2 text-sm" />
                        <input value={formData.emergencyContactPhone || ''} onChange={(e) => setFormData(fd => ({ ...fd, emergencyContactPhone: e.target.value }))} placeholder="Contact Phone" className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z"/></svg>
                  Role
                </div>
                <div className="text-sm font-medium text-slate-800">{role}</div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/></svg>
                  Verification
                </div>
                <div className="flex items-center gap-2">
                  {verified ? (
                    <Badge color="bg-blue-50 text-blue-700">Verified</Badge>
                  ) : (
                    <Badge color="bg-gray-100 text-gray-700">Unverified</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500">Member since</div>
                <div className="text-sm font-medium text-slate-800">{memberSince}</div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500">Last login</div>
                <div className="text-sm font-medium text-slate-800">{lastLogin}</div>
              </div>
              <div className="pt-3">
                <button onClick={() => setShowChangePassword(s => !s)} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm">{showChangePassword ? 'Hide password form' : 'Change password'}</button>
                {showChangePassword && (
                  <div className="mt-3 space-y-2">
                    <input type="password" placeholder="Current password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    <input type="password" placeholder="New password" value={pwdForm.newPassword} onChange={(e) => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    <input type="password" placeholder="Confirm new password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                    <div className="flex items-center gap-2">
                      <button onClick={async () => {
                        // Validate fields
                        if (!pwdForm.currentPassword) { setMessage('Current password is required'); return }
                        if (!pwdForm.newPassword) { setMessage('New password is required'); return }
                        if (!pwdForm.confirmPassword) { setMessage('Confirm password is required'); return }
                        if (pwdForm.newPassword.length < 6) { setMessage('New password must be at least 6 characters'); return }
                        if (pwdForm.newPassword !== pwdForm.confirmPassword) { setMessage('New passwords do not match'); return }
                        if (pwdForm.currentPassword === pwdForm.newPassword) { setMessage('New password must be different from current password'); return }
                        try {
                          setChangingPwd(true)
                          const res = await authService.changePassword(pwdForm.currentPassword, pwdForm.newPassword)
                          setMessage('Password changed successfully')
                          setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          setShowChangePassword(false)
                        } catch (err) {
                          console.error('Password change failed', err)
                          const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Password change failed'
                          setMessage(errMsg)
                        } finally {
                          setChangingPwd(false)
                          setTimeout(() => setMessage(''), 4000)
                        }
                      }} className="px-3 py-2 rounded-md bg-indigo-600 text-white">{changingPwd ? 'Changing...' : 'Change password'}</button>
                      <button onClick={() => { setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowChangePassword(false) }} className="px-3 py-2 rounded-md border border-gray-200 bg-white">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showDebug && (
          <div className="mt-6 bg-white border border-red-100 rounded-lg p-4 text-sm text-red-700">
            <div className="font-semibold mb-2">Profile debug data</div>
            <pre className="text-xs text-gray-700 max-h-64 overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
