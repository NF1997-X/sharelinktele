import { Zap, Shield, Globe, Clock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Upload and share files in seconds. Our optimized infrastructure ensures quick processing and delivery."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Files stored securely in Telegram's infrastructure. Your data is protected with industry-standard encryption."
  },
  {
    icon: Globe,
    title: "Share Anywhere",
    description: "Generated links work everywhere. Share via email, messaging, or social media with a single click."
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "24/7 access to your shared files. Links remain active and accessible whenever you need them."
  }
];

export default function Features() {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Why Choose ShareLink Bot
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for effortless file sharing
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex gap-3 p-4 rounded-xl border border-border hover-elevate"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
