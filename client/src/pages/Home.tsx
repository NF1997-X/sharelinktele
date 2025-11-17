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
          <Link href="/upload">
            <Button size="default" className="px-6" data-testid="button-cta-upload">
              Upload Your First File
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
