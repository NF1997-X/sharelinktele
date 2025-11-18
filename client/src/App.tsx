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
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simulate loading time for smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Small delay for smooth transition
      setTimeout(() => setShowContent(true), 150);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {isLoading && <LoadingScreen />}
          {!isLoading && (
            <div 
              className={`min-h-screen bg-background transition-all duration-700 ease-out ${
                showContent 
                  ? 'animate-in fade-in zoom-in-95 duration-500' 
                  : 'opacity-0 scale-95'
              }`}
            >
              <Navigation />
              <main className="transition-all duration-300 ease-in-out">
                <Router />
              </main>
            </div>
          )}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error Loading App</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }
}

export default App;
