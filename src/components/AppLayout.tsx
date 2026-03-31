import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scan/new', label: 'New Scan', icon: PlusCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground/90 bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="paper-badge bg-foreground text-background border-foreground text-xs">
              <Zap className="h-3.5 w-3.5" /> Poolabs
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.to} to={item.to}>
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-display uppercase tracking-wider rounded-sm transition-colors ${
                      location.pathname === item.to
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground/90 rounded-sm bg-primary text-primary-foreground text-xs font-mono-display font-bold">
                {initials}
              </div>
              <button onClick={signOut} className="p-1.5 hover:bg-secondary rounded-sm transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <button
              className="md:hidden p-1.5 hover:bg-secondary rounded-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t-2 border-foreground/20 bg-card p-4 space-y-2">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono-display uppercase tracking-wider rounded-sm transition-colors ${
                    location.pathname === item.to
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              </Link>
            ))}
            <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono-display uppercase tracking-wider rounded-sm hover:bg-secondary">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="container py-6">{children}</main>
    </div>
  );
}
