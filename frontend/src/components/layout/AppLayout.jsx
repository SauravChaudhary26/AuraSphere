import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, FileText,
  Swords, Timer, Trophy, Store, CalendarClock, Sparkles, Menu, X, LogOut, User,
} from "lucide-react";
import Logo, { LogoMark } from "../Logo";
import { ThemeToggle, Avatar } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { fetchPoints } from "../../utils/redux/pointsSlice";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/assignment", label: "Assignments", icon: FileText },
  { to: "/challenge", label: "Challenges", icon: Swords },
  { to: "/studyroom", label: "Study Room", icon: Timer },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/store", label: "Aura Store", icon: Store },
  { to: "/events", label: "Events", icon: CalendarClock },
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
          isActive ? "bg-primary/12 text-primary" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`
      }
      style={({ isActive }) => (isActive ? { background: "color-mix(in srgb, var(--primary) 13%, transparent)", color: "var(--primary)" } : undefined)}
    >
      <Icon size={19} />
      {label}
    </NavLink>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const aura = useSelector((s) => s.points.total);

  useEffect(() => {
    dispatch(fetchPoints());
  }, [dispatch]);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = ({ onNav }) => (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 px-2 pt-1">
        <Logo size={26} />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((n) => (
          <NavItem key={n.to} {...n} onClick={onNav} />
        ))}
      </nav>
      <div className="mt-2 border-t border-border pt-3">
        <NavItem to="/profile" label="Profile" icon={User} onClick={onNav} />
        <button
          onClick={doLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted transition hover:bg-surface-2 hover:text-danger"
        >
          <LogOut size={19} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[80%] border-r border-border bg-surface">
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-ground/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="lg:hidden">
              <LogoMark size={26} />
            </div>
            <div className="flex-1" />
            <NavLink
              to="/store"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
              style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
            >
              <Sparkles size={15} /> <span className="mono">{Number(aura || 0).toLocaleString()}</span>
            </NavLink>
            <ThemeToggle />
            <NavLink to="/profile" aria-label="Profile">
              <Avatar name={user?.name} src={user?.avatar} size={34} />
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
