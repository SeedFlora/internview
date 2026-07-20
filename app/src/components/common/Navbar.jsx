import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getInitials, getAvatarColor } from "@/utils/avatar.js";
import { SkeletonCircle } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InboxDropdown } from "@/features/inbox/components/InboxDropdown";
import { useInboxNotifications } from "@/features/inbox/hooks/useInboxNotifications";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();
  const {
    inboxData,
    inboxLoading,
    isInboxOpen,
    handleOpenChange,
    fetchInbox,
  } = useInboxNotifications();

  // Exclude paths for /register and /login
  if (location.pathname === "/register" || location.pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Redirect after logout completes (or fails)
      window.location.href = "/";
    }
  };

  const handleInboxItemClick = (item) => {
    handleOpenChange(false);
    navigate(`/inbox/${item.referenceId}?type=${item.type}`);
  };

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-1 flex items-center gap-3">
          <a href="/" className="group inline-flex items-center gap-2">
            <Logo />
          </a>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold border-orange-400 text-orange-500 hover:bg-orange-50"
              onClick={() => navigate("/admin")}
            >
              Admin
            </Button>
          )}
        </div>
        {/* Right side */}
        <div className="flex items-center justify-end gap-2 md:gap-6">
          {loading ? (
            <div className="w-10 h-10">
              <SkeletonCircle size={40} />
            </div>
          ) : isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-sm md:inline-flex min-h-10">
                <a href="/categories">Categories</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden text-sm md:inline-flex min-h-10">
                <a href="/companies">Companies</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden text-sm md:inline-flex min-h-10">
                <a href="/compare">Compare</a>
              </Button>
              <InboxDropdown
                isOpen={isInboxOpen}
                onOpenChange={handleOpenChange}
                onTriggerHover={fetchInbox}
                inboxLoading={inboxLoading}
                inboxData={inboxData}
                onItemClick={handleInboxItemClick}
              />

              {/* Authenticated User Avatar with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  {getInitials(user.firstName || user.username || user.email || "User")}
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <a href="/">Home</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/profile">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Guest Links */}
              <a href="/categories" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden md:block px-2 py-2 min-h-[40px] inline-flex items-center">
                Categories
              </a>
              <a href="/companies" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden md:block px-2 py-2 min-h-[40px] inline-flex items-center">
                Companies
              </a>
              <a href="/compare" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden md:block px-2 py-2 min-h-[40px] inline-flex items-center">
                Compare
              </a>
              <Button asChild size="sm" className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg px-5">
                <a href="/login">Get Started</a>
              </Button>
            </>
          )}
        </div>
      </div>

    </header>
  );
}