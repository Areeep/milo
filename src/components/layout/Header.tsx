import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Route as rootRoute } from "#/routes/__root";
import { supabase } from "#/lib/supabase";
import { useNavigate } from "@tanstack/react-router";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { auth } = rootRoute.useRouteContext();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const profile = auth.profile;
  const user = auth.user;

  // Handle clicking outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <header className="flex h-16 shrink-0 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Mobile Menu Button & Search Bar */}
      <div className="flex items-center w-full max-w-md gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <Icon icon="lucide:menu" className="h-6 w-6" />
        </button>
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon icon="lucide:search" className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari proyek, tugas, atau anggota..."
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 bg-gray-50 hover:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative ml-4 flex shrink-0 items-center" ref={profileMenuRef}>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 ring-1 ring-gray-300">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>
        </button>

        {/* Floating Profile Menu */}
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-10 z-50 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.username?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {profile?.username || "Pengguna"}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {user?.email || profile?.email || "Tidak ada email"}
                </span>
              </div>
            </div>

            <div className="py-1">
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                }}
              >
                <Icon icon="lucide:settings" className="h-4 w-4" />
                Kelola Akun
              </button>
            </div>
            
            <div className="border-t border-gray-100 py-1">
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <Icon icon="lucide:log-out" className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
