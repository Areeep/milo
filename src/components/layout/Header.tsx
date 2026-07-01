import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Route as rootRoute } from "#/routes/__root";
import { supabase } from "#/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Settings, LogOut, Menu, Search } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { auth } = rootRoute.useRouteContext();
  const navigate = useNavigate();

  const profile = auth.profile;
  const user = auth.user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const initials = profile?.username?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="border-border bg-background flex h-16 w-full shrink-0 items-center justify-between border-b px-4 md:px-6">
      {/* Mobile Menu Button & Search Bar */}
      <div className="flex w-full max-w-md items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="relative w-full">
          <Search className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari proyek, tugas, atau anggota..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className="ml-4 flex shrink-0 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0"
              />
            }
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.username}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={profile?.avatar_url ?? undefined}
                    alt={profile?.username}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-semibold">
                    {profile?.username ?? "Pengguna"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email ?? profile?.email ?? "Tidak ada email"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Kelola Akun
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
