"use client"

import { useState } from 'react'
import { MeetingHeader } from './MeetingHeader'
import { ParticipantTile } from './ParticipantTile'
import { MeetingControls } from './MeetingControls'

interface Participant {
  id: string
  name: string
  isLocal: boolean
  isMuted: boolean
  hasVideo: boolean
}

interface MeetingViewProps {
  meetingTitle: string
  meetingSubtitle?: string
  participants: Participant[]
  activeSpeakerId?: string
  onEndCall: () => void
  onSettingsClick?: () => void
}

export function MeetingView({
  meetingTitle,
  meetingSubtitle,
  participants,
  activeSpeakerId,
  onEndCall,
  onSettingsClick,
}: MeetingViewProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <MeetingHeader
        title={meetingTitle}
        subtitle={meetingSubtitle}
        onSettingsClick={onSettingsClick}
      />

      {/* Participants Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <ParticipantTile
                key={participant.id}
                name={participant.name}
                isLocal={participant.isLocal}
                isActiveSpeaker={activeSpeakerId === participant.id}
                isMuted={participant.isMuted}
                hasVideo={participant.hasVideo}
              />
            ))}

            {/* Empty State */}
            {participants.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Waiting for others to join...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <MeetingControls
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
        onEndCall={onEndCall}
      />
    </div>
  )
}
