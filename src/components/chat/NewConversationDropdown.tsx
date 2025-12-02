"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Users, User } from "lucide-react";
import {
  searchUsersInDB,
  filterRecentUsers,
  combineSearchResults,
  debounce,
  type SearchableUser,
} from "./utils/userSearch";

interface RecentUser {
  id: string;
  name: string;
  avatar?: string;
}

interface NewConversationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onCreateGroup: () => void;
  recentUsers: RecentUser[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NewConversationDropdown({
  isOpen,
  onClose,
  onSelectUser,
  onCreateGroup,
  recentUsers,
  anchorRef,
}: NewConversationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dbUsers, setDbUsers] = useState<SearchableUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter recent users based on search query
  const filteredRecentUsers = filterRecentUsers(recentUsers, searchQuery);

  // Combine and deduplicate results
  const { dbUsers: uniqueDbUsers, recentUsers: uniqueRecentUsers } =
    combineSearchResults(dbUsers, filteredRecentUsers);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setDbUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await searchUsersInDB(query);
      setDbUsers(results);
      setIsSearching(false);
    }, 300),
    []
  );

  // Handle search query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-0 left-full ml-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-sm text-gray-900 placeholder:text-gray-500"
            autoFocus
          />
        </div>
      </div>

      {/* New Group Option */}
      <div
        onClick={() => {
          onCreateGroup();
          onClose();
        }}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-[#0066CC] flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">New Group</p>
          <p className="text-xs text-gray-500">Create a group conversation</p>
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-80 overflow-y-auto">
        {isSearching ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p className="text-sm">Searching...</p>
          </div>
        ) : uniqueDbUsers.length === 0 && uniqueRecentUsers.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p className="text-sm">
              {searchQuery ? "No users found" : "No recent conversations"}
            </p>
          </div>
        ) : (
          <>
            {/* Database Search Results (up to 3) */}
            {uniqueDbUsers.length > 0 && (
              <>
                {searchQuery && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Search Results
                  </div>
                )}
                {uniqueDbUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user.id);
                      onClose();
                      setSearchQuery("");
                      setDbUsers([]);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FFB300] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-900" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate capitalize">
                        {user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Recent Conversations */}
            {uniqueRecentUsers.length > 0 && (
              <>
                {uniqueDbUsers.length > 0 && searchQuery && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Recent
                  </div>
                )}
                {uniqueRecentUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user.id);
                      onClose();
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FFB300] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-900" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate capitalize">
                        {user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
