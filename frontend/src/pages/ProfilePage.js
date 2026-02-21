import React from 'react'

const Badge = ({ children, color = 'bg-blue-100 text-blue-800' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>{children}</span>
)

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-sm text-gray-800 font-medium">{value}</div>
  </div>
)

export function ProfilePage() {
  const user = {
    fullName: 'Jordan Avery',
    role: 'Product Manager',
    verified: true,
    bio: 'Product leader focused on building delightful, reliable SaaS experiences for enterprise teams.',
    email: 'jordan.avery@example.com',
    phone: '+1 (555) 123-4567',
    university: 'Stanford University',
    location: 'San Francisco, CA',
    memberSince: 'Jan 2021',
    lastLogin: '2 hours ago',
    completion: 78,
    avatar: 'https://images.unsplash.com/photo-1545996124-3a4f8b0a3a8b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=8b6f3e1b3c'
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="h-44 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          {/* Avatar and main card */}
          <div className="-mt-16 px-6 pb-6">
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                <div className="flex-none -mt-12 md:mt-0">
                  <div className="w-32 h-32 rounded-full ring-4 ring-white overflow-hidden shadow-lg">
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex-1 mt-4 md:mt-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-semibold text-slate-900">{user.fullName}</h1>
                    <Badge color="bg-gray-100 text-gray-800">{user.role}</Badge>
                    {user.verified && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 max-w-2xl">{user.bio}</p>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">Profile completion</div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${user.completion}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{user.completion}% complete</div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:flex-none">
                  <div className="bg-white rounded-lg border border-gray-100 px-4 py-2 shadow-sm text-sm text-slate-700">
                    <div className="font-medium">Actions</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">Edit Profile</button>
                      <button className="px-3 py-1 rounded-md border border-gray-200 text-sm">Settings</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="divide-y divide-gray-100">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="University" value={user.university} />
              <InfoRow label="Location" value={user.location} />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-sm font-medium text-slate-800">{user.role}</div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="text-sm text-gray-500">Verification</div>
                <div className="flex items-center gap-2">
                  {user.verified ? (
                    <Badge color="bg-blue-100 text-blue-800">Verified</Badge>
                  ) : (
                    <Badge color="bg-gray-100 text-gray-700">Unverified</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="text-sm text-gray-500">Member since</div>
                <div className="text-sm font-medium text-slate-800">{user.memberSince}</div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-500">Last login</div>
                <div className="text-sm font-medium text-slate-800">{user.lastLogin}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
