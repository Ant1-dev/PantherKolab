"use client";

import { X, UserPlus, MonitorUp, MessageSquareText } from "lucide-react";

interface MoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCallOwner: boolean;
  onAddParticipant?: () => void;
  onShareScreen?: () => void;
  onToggleChat?: () => void;
}

export function MoreOptionsModal({
  isOpen,
  onClose,
  isCallOwner,
  onAddParticipant,
  onShareScreen,
  onToggleChat,
}: MoreOptionsModalProps) {
  if (!isOpen) return null;

  const handleOptionClick = (action?: () => void) => {
    action?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/50">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-xs mx-0 sm:mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">More Options</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Options List */}
        <div className="py-2">
          {isCallOwner && (
            <button
              onClick={() => handleOptionClick(onAddParticipant)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-[#00376f]" />
              <span className="text-gray-900">Add Participant</span>
            </button>
          )}
          <button
            onClick={() => handleOptionClick(onShareScreen)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <MonitorUp className="w-5 h-5 text-[#00376f]" />
            <span className="text-gray-900">Share Screen</span>
          </button>
          <button
            onClick={() => handleOptionClick(onToggleChat)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <MessageSquareText className="w-5 h-5 text-[#00376f]" />
            <span className="text-gray-900">Open Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
