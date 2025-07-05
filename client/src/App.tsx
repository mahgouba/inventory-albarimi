import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import InventoryPage from "@/pages/inventory";
import CardViewPage from "@/pages/card-view-new";

import AppearancePage from "@/pages/appearance";
import LocationPage from "@/pages/locations";
import LoginPage from "@/pages/login";
import UserManagementPage from "@/pages/user-management-simple";
import NotFound from "@/pages/not-found";

interface User {
  username: string;
  role: string;
  id: number;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // This component loads and applies theme settings
  useTheme();
  return <>{children}</>;
}

function Router({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <Switch>
      <Route path="/" component={() => <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
      <Route path="/cards" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
      <Route path="/card-view" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
      <Route path="/card-view-new" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
      <Route path="/locations" component={() => <LocationPage userRole={user.role} onLogout={onLogout} />} />
      {/* صفحات الأدمن فقط */}
      {user.role === "admin" && (
        <>
          <Route path="/appearance" component={() => <AppearancePage userRole={user.role} onLogout={onLogout} />} />
          <Route path="/user-management" component={() => <UserManagementPage onLogout={onLogout} />} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData);
      } catch (error) {
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div dir="rtl" className="font-arabic">
            <Toaster />
            {!user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Router user={user} onLogout={handleLogout} />
            )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
