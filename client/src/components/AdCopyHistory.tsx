import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Loader2, Trash2, RefreshCw, ChevronDown, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdCopyCard } from "./AdCopyCard";
import { getHistory, clearHistory } from "@/lib/historyStorage";

type HistoryItem = {
  id: number;
  productName: string;
  brandName: string;
  platform: string;
  tone: string;
  ageRange: string | null;
  createdAt: string;
  copies: Array<{
    headline: string;
    body: string;
    platform: string;
  }>;
};

export function AdCopyHistory() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Toggle expanded state for a history item
  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  // Fetch history data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/ad-copy-history'],
    queryFn: async () => {
      try {
        // Get history from localStorage first
        const historyData = getHistory();
        
        // If we have local history, use it
        if (historyData && historyData.length > 0) {
          return { success: true, data: historyData };
        }
        
        // Otherwise fetch from API (which will return mock data)
        const response = await fetch('/api/ad-copy-history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching history:', error);
        // Return empty data on error
        return { success: true, data: [] };
      }
    },
    throwOnError: false,
  });

  // Clear history mutation
  const { mutate: clearHistoryMutation, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      // Clear localStorage
      clearHistory();
      
      // Also call API to clear server-side history if needed
      const response = await apiRequest('DELETE', '/api/ad-copy-history', undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-copy-history'] });
      toast({
        title: "History cleared",
        description: "Your ad copy history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Regenerate an ad copy
  const { mutate: regenerate } = useMutation({
    mutationFn: async (item: HistoryItem) => {
      const response = await apiRequest('POST', '/api/generate-ad-copy', {
        productName: item.productName,
        brandName: item.brandName,
        platform: item.platform,
        tone: item.tone,
        ageRange: item.ageRange,
        variations: item.copies.length,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-copy-history'] });
      toast({
        title: "Regenerated!",
        description: "New ad copies have been generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate ad copies. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Format the creation time
  const formatCreationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  const historyItems = data?.data || [];
  const hasHistory = historyItems.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Recent Generations</h2>
        {hasHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearHistoryMutation()}
            disabled={isClearing}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear History"}
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-10 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Loading history...</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="py-10 text-center">
          <p className="text-sm text-red-500">Failed to load history. Please try refreshing the page.</p>
        </div>
      )}

      {/* History items */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {hasHistory ? (
            historyItems.map((item: HistoryItem) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 px-4 py-3 flex justify-between cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{item.productName}</span>
                    <span className="ml-2 text-xs text-gray-500">{formatCreationTime(item.createdAt)}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedItems.has(item.id) ? 'transform rotate-180' : ''}`} />
                </div>
                
                {expandedItems.has(item.id) && (
                  <div className="px-4 py-3">
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium">Platform:</span> {item.platform} | 
                      <span className="font-medium"> Tone:</span> {item.tone}
                      {item.ageRange && (
                        <span> | <span className="font-medium">Age:</span> {item.ageRange}</span>
                      )}
                    </div>
                    
                    {/* Show first ad copy */}
                    {item.copies && item.copies[0] && (
                      <p className="text-sm text-gray-600">{item.copies[0].headline}. {item.copies[0].body.substring(0, 100)}...</p>
                    )}
                    
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => regenerate(item)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <PlusCircle className="h-10 w-10 mx-auto text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No history yet. Generate some ad copies!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
