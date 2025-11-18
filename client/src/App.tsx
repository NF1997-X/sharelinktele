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
    // Ensure minimum loading time to prevent flickering
    const minimumLoadTime = 600; // Reduced from 800ms
    const startTime = Date.now();

    const finishLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
      
      setTimeout(() => {
        // Use double RAF for ultra-smooth transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsLoading(false);
            setShowContent(true);
          });
        });
      }, remainingTime);
    };

    // Check if document is ready
    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
      return () => window.removeEventListener('load', finishLoading);
    }
  }, []);
    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
      return () => window.removeEventListener('load', finishLoading);
    }
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Loading Screen with improved overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-background loading-overlay">
              <LoadingScreen />
            </div>
          )}
          
          {/* Main Content with smoother transitions */}
          <div 
            className={`min-h-screen bg-background transition-all duration-500 ease-out ${
              isLoading 
                ? 'opacity-0 scale-98 pointer-events-none' 
                : showContent 
                  ? 'opacity-100 scale-100 smooth-appear' 
                  : 'opacity-0 scale-98'
            }`}
          >
            <Navigation />
            <main className="transition-all duration-200 ease-in-out smooth-slide-in">
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
