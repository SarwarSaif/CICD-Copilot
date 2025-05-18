import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Photos from "@/pages/Photos";
import Collections from "@/pages/Collections";
import Shared from "@/pages/Shared";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

function Router() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <MobileHeader />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/photos" component={Photos} />
          <Route path="/collections" component={Collections} />
          <Route path="/shared" component={Shared} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        <FloatingActionButton />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
