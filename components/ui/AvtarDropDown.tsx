"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AvatarDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <div
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {user.profileUrl ? (
          <img
            src={user.profileUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-9 w-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition-all"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow-sm hover:shadow-md transition-all">
            {user.firstName[0].toUpperCase()}
            {user.lastName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => { router.push("/dashboard"); setOpen(false); }}
            >
              🏠 My Dashboard
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => { router.push("/dashboard/profile"); setOpen(false); }}
            >
              👤 My Profile
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => { router.push("/settings"); setOpen(false); }}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Logout button */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => { logout(); setOpen(false); }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
