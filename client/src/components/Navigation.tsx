import { Link, useLocation } from "wouter";
import { Upload, Library, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/library", label: "Library", icon: Library },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="bg-primary rounded-lg p-1.5">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm text-foreground">
                ShareLink Bot
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className={`h-3.5 w-3.5 mr-1.5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`} />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden transition-all duration-200 ease-in-out hover:scale-110 hover:bg-secondary/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-4 h-4">
                <X className={`h-4 w-4 absolute transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                }`} />
                <Menu className={`h-4 w-4 absolute transition-all duration-300 ease-in-out ${
                  !isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                }`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
            <nav className="py-4 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200 ease-in-out transform ${
                        isActive 
                          ? "bg-secondary text-secondary-foreground scale-[1.02]" 
                          : "hover:bg-secondary/50 hover:translate-x-2"
                      }`}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.3s ease-out forwards'
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`h-4 w-4 transition-transform duration-200 ${
                        isActive ? 'scale-110' : ''
                      }`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
