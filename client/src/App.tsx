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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initApp = () => {
      // Shorter, more predictable loading time
      timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          setIsLoading(false);
        });
      }, 500); // Fixed 500ms loading
    };

    // Start initialization immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('DOMContentLoaded', initApp);
    };
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Loading Screen */}
          <div 
            className={`fixed inset-0 z-50 bg-background transition-opacity duration-300 ${
              isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <LoadingScreen />
          </div>
          
          {/* Main Content */}
          <div 
            className={`min-h-screen bg-background transition-opacity duration-300 delay-150 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Navigation />
            <main>
              <Router />
            </main>
          </div>
          
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
