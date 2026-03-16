import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  MessageSquare,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/agent/dashboard' },
  { label: 'My Patients', icon: Users, path: '/agent/patients' },
  { label: 'Add Patient', icon: UserPlus, path: '/agent/patients/new' },
  { label: 'Commissions', icon: DollarSign, path: '/agent/commissions' },
  { label: 'Quote Requests', icon: FileText, path: '/agent/quotes' },
  { label: 'Negotiations', icon: MessageSquare, path: '/agent/negotiations' },
  { label: 'Profile', icon: Settings, path: '/agent/profile' },
];

const AgentSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/agent/dashboard" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-bold text-foreground">MediConnect</h2>
            <p className="text-xs text-muted-foreground">Agent Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/agent/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AgentSidebar;
