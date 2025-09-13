import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layouts/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Directory } from "./pages/Directory";
import { Events } from "./pages/Events";
import { Profile } from "./pages/Profile";
import { Mentorship } from "./pages/Mentorship";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Main App Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="directory" element={<Directory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route path="events" element={<Events />} />
            <Route path="donations" element={<div>Donations Page</div>} />
            <Route path="governance" element={<div>Governance Page</div>} />
            <Route path="stories" element={<div>Stories Page</div>} />
            <Route path="ai-hub" element={<div>AI Hub Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
            <Route path="admin" element={<div>Admin Panel Page</div>} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
