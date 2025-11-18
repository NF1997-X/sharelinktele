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
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
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
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive 
                          ? "bg-secondary text-secondary-foreground" 
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
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
