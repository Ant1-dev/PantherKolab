"use client";

import { useState } from "react";
import { MeetingViewDev } from "@/components/calls/MeetingViewDev";

/**
 * Calls page - Development UI for call interface
 * This page allows testing the MeetingView UI without actual Chime integration
 */
export default function CallsPage() {
  const [showMeeting, setShowMeeting] = useState(true);

  if (!showMeeting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Call Ended
          </h1>
          <button
            onClick={() => setShowMeeting(true)}
            className="px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
          >
            Start New Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <MeetingViewDev
      meetingTitle="Study Session"
      meetingSubtitle="COP 4338 - Systems Programming"
      isCallOwner={true}
      onEndCall={() => {
        console.log("End call clicked");
        setShowMeeting(false);
      }}
      onLeaveCall={() => {
        console.log("Leave call clicked");
        setShowMeeting(false);
      }}
      onSettingsClick={() => {
        console.log("Settings clicked");
      }}
    />
  );
}
