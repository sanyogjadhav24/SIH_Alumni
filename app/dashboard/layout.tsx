"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "../hooks/useAuth";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  Home,
  Users,
  MessageCircle,
  Bell,
  Calendar,
  Briefcase,
  Clock,
  Brain,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AvatarDropdown from "@/components/ui/AvtarDropDown";

const navigation = [
  { name: "Feed", href: "/dashboard", icon: Home },
  { name: "My Network", href: "/dashboard/network", icon: Users, badge: "12" },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageCircle,
    badge: "2",
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    badge: "5",
  },
  { name: "Events", href: "/dashboard/events", icon: Calendar, badge: "5" },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase, badge: "8" },
  { name: "StoryTimeline", href: "/dashboard/story-timeline", icon: Clock },
  { name: "AI Hub", href: "/dashboard/ai-hub", icon: Brain },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Stats Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
        <div className="flex items-center justify-center gap-12 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">2,847+</div>
            <div className="text-purple-100">Alumni Connected</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">245+</div>
            <div className="text-purple-100">Active Batches</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">94%</div>
            <div className="text-purple-100">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">1,288+</div>
            <div className="text-purple-100">Job Offers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">156+</div>
            <div className="text-purple-100">Events Hosted</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                AlmaConnect
              </span>
            </div>
            <div className="relative ml-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alumni, posts, events..."
                className="pl-10 w-80 bg-gray-50 dark:bg-gray-700 border-0 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              📧
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="sm">
              📅
            </Button>
            <Button variant="ghost" size="sm">
              💼
            </Button>
            <Button variant="ghost" size="sm">
              🎓
            </Button>
            <Button variant="ghost" size="sm">
              ⚙️
            </Button>
            <ThemeToggle />
            <AvatarDropdown/>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={cn(
            "w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Profile Section */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-white">
                {user?.profileUrl === ""
                ? `${user?.firstName[0].toUpperCase()}${user?.lastName[0].toUpperCase()}`
                : <img src={user?.profileUrl}></img>}

                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName} {"("+user?.role+")"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.universityName.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Class of {user?.graduationYear}
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Profile views:</span>
                <span>24</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span>156</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <Badge
                          className={cn(
                            "text-xs",
                            isActive
                              ? "bg-white text-primary"
                              : "bg-primary text-white"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Recent Activity */}
          <div className="p-4 border-t">
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">
              Recent Activity
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  New alumni joined from your batch
                </span>
              </div>
              <div className="text-gray-400 dark:text-gray-500">
                2 hours ago
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Upcoming reunion event
                </span>
              </div>
              <div className="text-gray-400 dark:text-gray-500">1 day ago</div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t">
            <Link
              href="/settings"
              className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
    </ProtectedRoute>

  );
}
