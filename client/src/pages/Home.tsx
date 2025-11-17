import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <Features />
      
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Ready to Start Sharing?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Join thousands of users who trust ShareLink Bot for their file sharing needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="text-sm">
                Start Uploading
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="outline" size="lg" className="text-sm">
                View Library
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
