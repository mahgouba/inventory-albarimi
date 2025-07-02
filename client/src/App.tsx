import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InventoryPage from "@/pages/inventory";
import CardViewPage from "@/pages/card-view";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

interface User {
  username: string;
  role: string;
  id: number;
}

function Router({ user }: { user: User }) {
  return (
    <Switch>
      <Route path="/" component={() => <InventoryPage userRole={user.role} />} />
      <Route path="/cards" component={() => <CardViewPage userRole={user.role} />} />
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
      <TooltipProvider>
        <div dir="rtl" className="font-arabic">
          <Toaster />
          {!user ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Router user={user} />
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
