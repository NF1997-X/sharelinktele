import { Copy, CheckCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LinkDisplayProps {
  shareLink: string;
  label?: string;
}

export default function LinkDisplay({ shareLink, label = "Share Link" }: LinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    console.log('Link copied:', shareLink);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shared File',
        url: shareLink
      }).catch(() => console.log('Share cancelled'));
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={shareLink}
          readOnly
          className="flex-1 px-4 h-12 bg-muted border border-border rounded-lg text-foreground font-mono text-sm"
          data-testid="input-share-link-display"
        />
        <Button
          size="icon"
          className="h-12 w-12"
          onClick={handleCopy}
          data-testid="button-copy-link-display"
        >
          {copied ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={handleShare}
          data-testid="button-share-link-display"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      {copied && (
        <p className="text-sm text-chart-2">Link copied to clipboard!</p>
      )}
    </div>
  );
}
