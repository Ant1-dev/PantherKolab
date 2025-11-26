"use client";

interface ParticipantTileDevProps {
  name: string;
  isLocal?: boolean;
  isActiveSpeaker?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  avatarColor?: string;
}

/**
 * ParticipantTileDev - Development version of ParticipantTile
 *
 * This component mirrors the production ParticipantTile but uses
 * a colored avatar placeholder instead of actual video streams,
 * allowing for UI development without Chime SDK integration.
 */
export function ParticipantTileDev({
  name,
  isLocal = false,
  isActiveSpeaker = false,
  isMuted = false,
  hasVideo = true,
  avatarColor = "#003366",
}: ParticipantTileDevProps) {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-[#003366] to-[#004080] aspect-video flex items-center justify-center transition-all ${
        isActiveSpeaker ? "ring-4 ring-green-500" : ""
      }`}
    >
      {/* Video Placeholder or Avatar */}
      {hasVideo ? (
        // Simulated video with colored background and initials
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{initials}</span>
          </div>
        </div>
      ) : (
        // No video - show initials on dark background
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{initials}</span>
          </div>
        </div>
      )}

      {/* Name Label */}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md">
        <p className="text-white text-sm font-medium">
          {name} {isLocal && "(You)"}
        </p>
      </div>

      {/* Muted Indicator */}
      {isMuted && (
        <div className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        </div>
      )}

    </div>
  );
}
