/**
 * Mock ProfileList Component
 *
 * Right sidebar showing user profile information
 * Displays status, contact info, groups in common, and about section
 */

'use client';

export interface ProfileInfo {
  name: string;
  email: string;
  location: string;
  status: string;
  aboutMe: string;
  avatar?: string;
  isOnline: boolean;
  groupsInCommon: string[];
}

interface ProfileListProps {
  profile: ProfileInfo | null;
  onClose?: () => void;
}

export function ProfileList({ profile, onClose }: ProfileListProps) {
  if (!profile) {
    return null;
  }

  const initials = profile.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-100">
        {/* Avatar */}
        <div className="mb-4">
          <div className="w-full h-64 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg flex items-center justify-center relative overflow-hidden">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl text-white font-bold">{initials}</div>
            )}
          </div>
        </div>

        {/* Name and Online Status */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{profile.name}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className={`text-sm font-medium ${profile.isOnline ? 'text-green-600' : 'text-gray-600'}`}>
              {profile.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 font-medium">Message</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 font-medium">Audio</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 font-medium">Video</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="flex-1 p-6 space-y-6">
        {/* Status */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-2 tracking-wide">STATUS:</h3>
          <p className="text-sm text-gray-900">{profile.status}</p>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">INFO:</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-sm text-gray-900 font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email:</p>
              <p className="text-sm text-gray-900">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location:</p>
              <p className="text-sm text-gray-900">{profile.location}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-yellow-400"></div>

        {/* Groups in Common */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">GROUP IN COMMON</h3>
          <div className="space-y-2">
            {profile.groupsInCommon.map((group, index) => (
              <div
                key={index}
                className="text-sm text-gray-900 font-medium pb-2 border-b border-yellow-400 last:border-0"
              >
                {group}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-yellow-400"></div>

        {/* About Me */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">ABOUT ME</h3>
          <p className="text-sm text-gray-900 leading-relaxed">{profile.aboutMe}</p>
        </div>
      </div>
    </div>
  );
}
