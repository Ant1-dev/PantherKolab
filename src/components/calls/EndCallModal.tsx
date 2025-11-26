"use client";

import { useState } from "react";
import { X, LogOut, PhoneOff } from "lucide-react";

interface Participant {
  id: string;
  name: string;
}

interface EndCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
  onLeaveCall: (newOwnerId: string) => void;
  participants: Participant[];
  currentUserId: string;
}

export function EndCallModal({
  isOpen,
  onClose,
  onEndCall,
  onLeaveCall,
  participants,
  currentUserId,
}: EndCallModalProps) {
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>("");
  const [showTransferSelect, setShowTransferSelect] = useState(false);

  // Filter out current user from participants list
  const otherParticipants = participants.filter((p) => p.id !== currentUserId);

  const handleLeaveClick = () => {
    if (otherParticipants.length === 0) {
      // No other participants, just end the call
      onEndCall();
    } else if (otherParticipants.length === 1) {
      // Only one other participant, auto-select them
      onLeaveCall(otherParticipants[0].id);
    } else {
      // Multiple participants, show selection
      setShowTransferSelect(true);
    }
  };

  const handleConfirmTransfer = () => {
    if (selectedNewOwner) {
      onLeaveCall(selectedNewOwner);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {showTransferSelect ? "Transfer Ownership" : "Leave or End Call?"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showTransferSelect ? (
            <>
              <p className="text-gray-600 mb-4">
                Choose a participant to become the new call owner:
              </p>
              <div className="space-y-2 mb-6">
                {otherParticipants.map((participant) => (
                  <label
                    key={participant.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedNewOwner === participant.id
                        ? "border-[#00376f] bg-[#00376f]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="newOwner"
                      value={participant.id}
                      checked={selectedNewOwner === participant.id}
                      onChange={(e) => setSelectedNewOwner(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedNewOwner === participant.id
                          ? "border-[#00376f]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedNewOwner === participant.id && (
                        <div className="w-2 h-2 rounded-full bg-[#00376f]" />
                      )}
                    </div>
                    <span className="text-gray-900">{participant.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTransferSelect(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={!selectedNewOwner}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#00376f] text-white font-medium hover:bg-[#0052A3] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer & Leave
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                As the call owner, you can leave and transfer ownership to
                another participant, or end the call for everyone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleLeaveClick}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Leave Call
                </button>
                <button
                  onClick={onEndCall}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Call for Everyone
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
