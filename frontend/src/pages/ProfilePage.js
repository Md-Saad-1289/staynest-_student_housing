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
        if (mounted) setProfile(data)
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

    // Prefer context user if available (already fetched by AuthProvider)
    if (authUser) {
      setProfile(authUser)
      setLoading(false)
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
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow hover:opacity-95 transition">Edit profile</button>
                    <button className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm">Settings</button>
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
              <InfoRow
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h3.5a1.5 1.5 0 010 3H4v9h12V6h-3.5a1.5 1.5 0 010-3H16a2 2 0 012 2v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5z"/></svg>}
                label="Email"
                value={email || '—'}
              />
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
