import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  LayoutDashboard,
  LogIn,
  LogOut,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Sidebar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const navItemClass = (path: string) => {
    const isActive =
      path === "/" ? pathname === "/" : pathname.startsWith(path);
    return `sidebar-nav-item w-full${isActive ? " active" : ""}`;
  };

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-bold text-sidebar-foreground font-display leading-none">
              Authentica
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">
              Opportunity Mgmt
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          to="/"
          data-ocid="nav.dashboard.link"
          className={navItemClass("/")}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Pipeline
        </Link>
        <Link
          to="/contacts"
          data-ocid="nav.contacts.link"
          className={navItemClass("/contacts")}
        >
          <Users className="w-4 h-4 shrink-0" />
          Contacts
        </Link>
        <Link
          to="/calendar"
          data-ocid="nav.calendar.link"
          className={navItemClass("/calendar")}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          Calendar
        </Link>
        <Link
          to="/admin"
          data-ocid="nav.admin.link"
          className={navItemClass("/admin")}
        >
          <Shield className="w-4 h-4 shrink-0" />
          Admin
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {isLoggedIn ? (
          <button
            type="button"
            className="sidebar-nav-item w-full"
            onClick={clear}
            data-ocid="nav.logout.button"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            className="sidebar-nav-item w-full"
            onClick={() => login()}
            data-ocid="nav.login.button"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
