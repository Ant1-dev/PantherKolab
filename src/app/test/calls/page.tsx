"use client";

import { useEffect, useRef, useState } from "react";
import { MeetingView } from "@/components/calls/MeetingView";
import { IncomingCallModal } from "@/components/calls/IncomingCallModal";

import io, { Socket } from "socket.io-client";
import { useAuth } from "@/components/contexts/AuthContext";
import { BASENAME } from "@/lib/utils";

export default function MeetingUITestPage() {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [callType, setCallType] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [participants, setParticipants] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isRinging, setIsRinging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [meetingData, setMeetingData] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const auth = useAuth();
  const localUserId = auth.user?.userId;

  useEffect(() => {
    auth.getAccessToken().then((token) => setAccessToken(token as string));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    socketRef.current = io(BASENAME, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: accessToken,
      },
    });

    // Listen for call ringing (after initiating)
    socketRef.current.on(
      "call-ringing",
      (data: { sessionId: string; recipientId: string }) => {
        console.log("Call is ringing. SessionId:", data.sessionId);
        setSessionId(data.sessionId);
        setIsCallInitiator(true); // This user initiated the call
      }
    );

    // Listen for incoming calls
    socketRef.current.on(
      "incoming-call",
      (data: {
        sessionId: string;
        callerId: string;
        callerName: string;
        callType: string;
      }) => {
        console.log("Got a call from " + data.callerName);
        setSessionId(data.sessionId);
        setCallerId(data.callerId);
        setCallerName(data.callerName);
        setCallType(data.callType as "DIRECT" | "GROUP");
        setIsCallInitiator(false); // This user is receiving the call
        setShowIncomingCall(true);
      }
    );

    // Listen for call connected (meeting created)
    socketRef.current.on(
      "call-connected",
      (data: {
        sessionId: string;
        meeting: unknown;
        attendees: Record<string, unknown>;
      }) => {
        console.log("Call connected! MeetingId:", data.meeting);
        setIsRinging(false);
        setIsConnecting(false);
        setMeetingData(data);
        setShowMeeting(true);
      }
    );

    // Listen for call rejected
    socketRef.current.on(
      "call-rejected",
      (data: { userId: string; sessionId: string }) => {
        console.log("Call rejected by " + data.userId);
        setIsRinging(false);
        setIsConnecting(false);
        alert("Call was declined");
      }
    );

    // Listen for connection failures
    socketRef.current.on(
      "call-connection-failed",
      (data: { error: string; sessionId: string }) => {
        console.error("Call connection failed:", data.error);
        setIsRinging(false);
        setIsConnecting(false);
        alert("Failed to connect call: " + data.error);
      }
    );

    // Listen for call errors
    socketRef.current.on("call-error", (data: { error: string }) => {
      console.error("Call error:", data.error);
      setIsRinging(false);
      setIsConnecting(false);
      alert("Call error: " + data.error);
    });

    // Listen for call ended (when someone ends the call for everyone)
    socketRef.current.on(
      "call-ended",
      (data: { sessionId: string; endedBy: string }) => {
        console.log(`Call ended by ${data.endedBy}`);
        setShowMeeting(false);
        setShowIncomingCall(false);
        setIsRinging(false);
        setIsConnecting(false);
        setMeetingData(null);
        alert("Call has ended");
      }
    );

    // Listen for participant left (when someone leaves without ending)
    socketRef.current.on(
      "participant-left",
      (data: { sessionId: string; userId: string }) => {
        console.log(`Participant ${data.userId} left the call`);
        // In a real implementation, we would remove this participant from the UI
        // For now, just log it
      }
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken]);

  // Mock participants
  const mockParticipants = [
    {
      id: "1",
      name: "Uma Swamy",
      isLocal: false,
      isMuted: false,
      hasVideo: true,
    },
    {
      id: "2",
      name: "Dr. Maria Rodriguez",
      isLocal: false,
      isMuted: false,
      hasVideo: true,
    },
    {
      id: "3",
      name: "George Washington",
      isLocal: false,
      isMuted: true,
      hasVideo: true,
    },
    {
      id: "4",
      name: "Michael Johnson",
      isLocal: false,
      isMuted: false,
      hasVideo: true,
    },
    { id: "5", name: "You", isLocal: true, isMuted: false, hasVideo: true },
    {
      id: "6",
      name: "Abraham Lincoln",
      isLocal: false,
      isMuted: false,
      hasVideo: false,
    },
  ].slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {!showMeeting ? (
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PantherKolab Meeting UI
          </h1>
          <p className="text-gray-600 mb-8">
            Professional video call interface based on FIU Virtual Meeting Room
            design
          </p>

          {/* Test Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Component Testing
            </h2>

            <div className="space-y-6">
              {/* Incoming Call Modal Test */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  1. Incoming Call Modal
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Professional modal with caller avatar, call type indicator,
                  and action buttons
                </p>
                <div className="flex gap-4 items-center flex-wrap">
                  <select
                    value={callType}
                    onChange={(e) =>
                      setCallType(e.target.value as "DIRECT" | "GROUP")
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  >
                    <option value="DIRECT">Direct Call</option>
                    <option value="GROUP">Group Call</option>
                  </select>
                  <button
                    onClick={() => {
                      setShowIncomingCall(true);
                    }}
                    className="px-6 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors font-medium"
                  >
                    Show Incoming Call
                  </button>
                </div>
              </div>

              {/* Meeting View Test */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  {`2. Meeting View. This user's id: ${auth.user?.userId}`}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Full meeting interface with participant grid, header, and
                  controls
                </p>
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Participants:
                    </label>
                    <input
                      type="text"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => {
                      console.log(
                        "Socket connected?",
                        socketRef.current?.connected
                      );
                      setIsRinging(true);
                      socketRef.current?.emit("new-call", {
                        userId: participants,
                        callerName: auth.user?.username,
                        callType: callType,
                      });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled={isRinging || isConnecting}
                  >
                    {isConnecting
                      ? "Connecting..."
                      : isRinging
                      ? "Ringing..."
                      : "Call test user 2"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Features
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Professional Design:</strong> Based on FIU Virtual
                  Meeting Room with university branding colors
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Participant Tiles:</strong> Responsive grid layout
                  with name labels and active speaker indicators
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Meeting Controls:</strong> Audio, video, screen share,
                  participants, chat, and end call buttons
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Incoming Call:</strong> Beautiful modal with caller
                  info and accept/decline options
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Visual Feedback:</strong> Mute indicators, active
                  speaker highlights, and smooth transitions
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>
                  <strong>Responsive:</strong> Adapts to different screen sizes
                  with mobile-first approach
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {/* Modals/Overlays */}
      {showIncomingCall && (
        <IncomingCallModal
          callerName={callerName}
          callType={callType}
          onAccept={() => {
            setShowIncomingCall(false);
            setIsConnecting(true);
            socketRef.current?.emit("accept-call", {
              sessionId,
              callerId,
              callerName,
            });
          }}
          onReject={() => {
            setShowIncomingCall(false);
            socketRef.current?.emit("reject-call", { sessionId, callerId });
          }}
        />
      )}

      {showMeeting && (
        <MeetingView
          meetingTitle="PantherKolab Video Call"
          meetingSubtitle="Florida International University"
          participants={mockParticipants}
          activeSpeakerId="2" // Dr. Maria Rodriguez is speaking
          isCallInitiator={isCallInitiator}
          meeting={meetingData?.meeting}
          attendee={
            localUserId ? meetingData?.attendees?.[localUserId] : undefined
          }
          localUserId={localUserId}
          onEndCall={() => {
            // End call for everyone
            socketRef.current?.emit("end-call", { sessionId });
            setShowMeeting(false);
            setIsRinging(false);
            setIsConnecting(false);
          }}
          onLeaveCall={() => {
            // Leave call but keep it active for others
            socketRef.current?.emit("leave-call", { sessionId });
            setShowMeeting(false);
            setIsRinging(false);
            setIsConnecting(false);
          }}
          onSettingsClick={() => alert("Settings clicked")}
        />
      )}
    </div>
  );
}
