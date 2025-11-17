import { Upload, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-4">
              Share Your Media Instantly with Telegram
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Upload your files, get shareable links powered by Telegram. 
              Fast, secure, and effortless file sharing for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/upload">
                <Button size="default" className="px-6" data-testid="button-start-sharing">
                  Start Sharing
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" size="default" className="px-6" data-testid="button-view-library">
                  View Library
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg p-3 border border-transparent">
                    <div className="bg-primary/10 rounded-lg p-2.5">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">Upload Media</h3>
                      <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                  </div>
                  
                  <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg p-3 border border-transparent">
                    <div className="bg-primary/10 rounded-lg p-2.5">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">Get Share Link</h3>
                      <p className="text-xs text-muted-foreground">Instant Telegram-powered links</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
