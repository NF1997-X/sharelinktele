import { Share2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-6 animate-in zoom-in-95 fade-in duration-700">
        {/* Logo/Icon Container */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Static outer ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary/10 rounded-full"></div>
          </div>
          
          {/* Animated spinning ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-transparent border-t-primary border-r-primary/60 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Center icon with subtle pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Share2 className="h-8 w-8 text-primary animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
        </div>
        
        {/* Text content with staggered animation */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <h2 className="text-xl font-semibold text-foreground">ShareLink Bot</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Preparing your media sharing experience...
          </p>
          
          {/* Loading dots indicator */}
          <div className="flex justify-center space-x-1 pt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
