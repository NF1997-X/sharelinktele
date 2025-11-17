import { Upload, Send, Link2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Media",
    description: "Drag and drop images, videos, or documents. Support for all common file types."
  },
  {
    icon: Send,
    title: "Saved to Telegram",
    description: "Files are securely stored in your designated Telegram channel for reliable access."
  },
  {
    icon: Link2,
    title: "Share the Link",
    description: "Get an instant shareable link. Copy and share with anyone, anywhere."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            How It Works
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to share your files with the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="relative">
                <div className="absolute -top-10 -left-4 text-5xl font-bold text-primary/5">
                  {index + 1}
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1.5 relative z-10">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
