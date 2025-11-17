import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import Library from "@/pages/Library";
import SharedLink from "@/pages/SharedLink";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={Upload} />
      <Route path="/library" component={Library} />
      <Route path="/s/:linkId" component={SharedLink} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false
  const [showContent, setShowContent] = useState(true); // Changed from false to true

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isLoading && <LoadingScreen />}
        {!isLoading && (
          <div className={`min-h-screen bg-background transition-all duration-500 ${showContent ? 'animate-in fade-in zoom-in-95' : 'opacity-0 scale-95'}`}>
            <Navigation />
            <Router />
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
