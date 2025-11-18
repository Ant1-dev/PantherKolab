"use client"

import { User } from 'lucide-react'

interface ParticipantTileProps {
  name: string
  isLocal?: boolean
  isActiveSpeaker?: boolean
  isMuted?: boolean
  hasVideo?: boolean
  videoElement?: HTMLVideoElement | null
}

export function ParticipantTile({
  name,
  isLocal = false,
  isActiveSpeaker = false,
  isMuted = false,
  hasVideo = true,
}: ParticipantTileProps) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-[#003366] to-[#004080] aspect-video flex items-center justify-center transition-all ${
        isActiveSpeaker ? 'ring-4 ring-green-500' : ''
      }`}
    >
      {/* Video or Avatar */}
      {hasVideo ? (
        <video
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-12 h-12 text-[#003366]" />
        </div>
      )}

      {/* Name Label */}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md">
        <p className="text-white text-sm font-medium">
          {name} {isLocal && '(You)'}
        </p>
      </div>

      {/* Muted Indicator */}
      {isMuted && (
        <div className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3a1 1 0 011 1v5a1 1 0 01-2 0V4a1 1 0 011-1z" />
            <path
              fillRule="evenodd"
              d="M7.05 9.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM14.95 9.293a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
