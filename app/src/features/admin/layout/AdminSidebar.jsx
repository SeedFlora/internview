import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Award,
  Database,
  Users,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Tag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin",
    end: true,
  },
  {
    label: "Company Verification",
    icon: Building2,
    to: "/admin/company-verification",
  },
  {
    label: "Certificate Verification",
    icon: Award,
    to: "/admin/certificate-verification",
  },
  {
    label: "Master Data",
    icon: Database,
    children: [
      { label: "Companies", icon: Briefcase, to: "/admin/master-data/companies" },
      // { label: "Majors", icon: GraduationCap, to: "/admin/master-data/majors" },
      { label: "Categories", icon: Tag, to: "/admin/master-data/categories" },
    ],
  },
  {
    label: "User Management",
    icon: Users,
    to: "/admin/user-management",
  },
];

function SidebarNavLink({ to, end, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-orange-50 text-orange-500"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={isActive ? "text-orange-500" : "text-gray-400"}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function AdminSidebar() {
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const getInitials = () => {
    const firstName = user?.firstName?.trim();
    if (firstName) return firstName[0].toUpperCase();
    const source = user?.name || user?.username || user?.email || "A";
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b px-5 py-5">
        <div className="flex items-center justify-center rounded-md bg-orange-500 p-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-4 0v2" />
            <path d="M8 7V5a2 2 0 0 0-4 0v2" />
          </svg>
        </div>
        <span className="text-base font-bold tracking-tight">
          <span className="text-gray-900">Intern</span>
          <span className="text-orange-500">View</span>
          <span className="text-gray-400 font-medium"> Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setMasterDataOpen((prev) => !prev)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <item.icon size={18} className="text-gray-400" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {masterDataOpen ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>
                {masterDataOpen && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <SidebarNavLink
                        key={child.to}
                        to={child.to}
                        icon={child.icon}
                        label={child.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <SidebarNavLink
              key={item.to}
              to={item.to}
              end={item.end}
              icon={item.icon}
              label={item.label}
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
            {getInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.firstName || user?.name || "Admin"}
            </p>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
            >
              Back to Main Site
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
