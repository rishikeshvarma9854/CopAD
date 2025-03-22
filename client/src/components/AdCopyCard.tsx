import { Badge } from "@/components/ui/badge";
import { useClipboard } from "@/hooks/use-clipboard";
import { Copy } from "lucide-react";
import { GeneratedAdCopy } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AdCopyCardProps {
  adCopy: GeneratedAdCopy;
}

export function AdCopyCard({ adCopy }: AdCopyCardProps) {
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();

  const handleCopyClick = () => {
    const textToCopy = `${adCopy.headline}\n\n${adCopy.body}`;
    copyToClipboard(textToCopy);
    
    toast({
      title: "Copied to clipboard!",
      description: "The ad copy has been copied to your clipboard.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  // Format platform name for display
  const formatPlatform = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="outline" className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
          {formatPlatform(adCopy.platform)}
        </Badge>
        <button 
          onClick={handleCopyClick}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Copy to clipboard"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>
      <div className="prose prose-sm">
        <p className="text-gray-800 font-medium mb-1">{adCopy.headline}</p>
        <p className="text-gray-700">{adCopy.body}</p>
      </div>
    </div>
  );
}
