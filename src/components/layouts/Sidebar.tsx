import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Search,
  MessageCircle,
  Calendar,
  DollarSign,
  Vote,
  Settings,
  BookOpen,
  Brain,
  Shield,
  User,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Profile", href: "/app/profile", icon: User },
  { name: "Directory", href: "/app/directory", icon: Search },
  { name: "Mentorship", href: "/app/mentorship", icon: MessageCircle },
  { name: "Events", href: "/app/events", icon: Calendar },
  { name: "Donations", href: "/app/donations", icon: DollarSign },
  { name: "Governance", href: "/app/governance", icon: Vote },
  { name: "Stories", href: "/app/stories", icon: BookOpen },
  { name: "AI Hub", href: "/app/ai-hub", icon: Brain },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/app/admin", icon: Shield },
];

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-30 h-full bg-card border-r border-border transition-all duration-300",
          open ? "w-64" : "w-16",
          "lg:relative lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            {open && (
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AlumniNet
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    !open && "px-3",
                    isActive && "bg-primary/10 text-primary border-r-2 border-primary"
                  )}
                  size={open ? "default" : "icon"}
                >
                  <Icon className="h-5 w-5" />
                  {open && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}

          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-border">
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between gap-3 h-12",
                    !open && "px-3"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    {open && <span>Admin</span>}
                  </div>
                  {open && <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              {open && (
                <CollapsibleContent className="space-y-1 pl-4">
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.href);
                    
                    return (
                      <Link key={item.name} to={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-10"
                          size="sm"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>
        </nav>
      </div>
    </>
  );
};