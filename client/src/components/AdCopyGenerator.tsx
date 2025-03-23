import { useState } from "react";
import { GeneratorForm } from "./GeneratorForm";
import { AdCopyCard } from "./AdCopyCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GenerateAdCopyParams, GeneratedAdCopy } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";

export function AdCopyGenerator() {
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedAdCopy[] | null>(null);
  const [lastFormData, setLastFormData] = useState<GenerateAdCopyParams | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GenerateAdCopyParams) => {
      try {
        // Simplified approach to avoid Response stream issues
        // Skip pre-validation and let the API handle all validations
        const response = await fetch('/api/ad-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include'
        });
        
        // Process the response
        if (!response.ok) {
          // Try to get error details if available
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
          } else {
            const text = await response.text();
            throw new Error(`Error ${response.status}: ${text || response.statusText}`);
          }
        }
        
        // If we get here, the response was successful
        const result = await response.json();
        return result;
      } catch (error: any) {
        console.error("Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setErrorMessage(null);
      if (data.success) {
        setGeneratedCopies(data.data.copies);
        queryClient.invalidateQueries({ queryKey: ['/api/ad-copy-history'] });
        toast({
          title: "Success!",
          description: "Ad copies generated successfully.",
        });
      } else {
        const message = data.message || "Failed to generate ad copies";
        setErrorMessage(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
    onError: async (error: any) => {
      console.error("Mutation error:", error);
      let message = "Failed to generate ad copies. Please try again later.";
      
      // Error is a JSON parse error
      if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        message = "Hugging Face API Error: Invalid API key or insufficient permissions. Please check your API key in the environment settings.";
        console.error("JSON Parse Error:", error.message);
      }
      // Handle fetch responses
      else if (error instanceof Response || error?.response instanceof Response) {
        const response = error instanceof Response ? error : error.response;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData?.message) {
              message = errorData.message;
            }
          } else {
            const text = await response.text();
            console.error("Non-JSON error response:", text);
            message = `Error ${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
      } 
      // Handle standard JS errors
      else if (error instanceof Error) {
        message = error.message;
      }
      
      // Set more user-friendly messages for common Hugging Face errors
      if (message.includes('quota exceeded') || message.includes('rate limit')) {
        message = "The Hugging Face API has reached its rate limit. Please try again later.";
      } else if (message.includes('invalid API key') || message.includes('Unauthorized')) {
        message = "Invalid Hugging Face API key. Please update your API key in the environment settings.";
      } else if (message.includes('Unexpected token') && message.includes('<!DOCTYPE')) {
        message = "Server error: Received HTML instead of JSON. Please check server logs.";
      }
      
      setErrorMessage(message);
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const generateMoreCopies = () => {
    if (lastFormData) {
      mutate(lastFormData);
    }
  };

  const handleFormSubmit = (data: GenerateAdCopyParams) => {
    setLastFormData(data);
    mutate(data);
  };

  const shouldShowResults = isPending || generatedCopies || errorMessage;

  return (
    <>
      {/* Generator Form */}
      <GeneratorForm onSubmit={handleFormSubmit} />
      
      {/* Results Section */}
      {shouldShowResults && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Generated Ad Copies</h2>
            {generatedCopies && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generateMoreCopies}
                disabled={isPending}
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Generate More
              </Button>
            )}
          </div>
          
          {/* Error state */}
          {errorMessage && !isPending && (
            <div className="py-6 px-4 border border-red-200 bg-red-50 rounded-lg flex flex-col items-center justify-center text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-red-500 mb-3" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">Generation Failed</h3>
              <p className="text-sm text-red-700">{errorMessage}</p>
              <Button 
                onClick={() => setErrorMessage(null)} 
                variant="outline" 
                className="mt-4"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          )}
          
          {/* Loading state */}
          {isPending && (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Generating creative ad copies...</p>
            </div>
          )}

          {/* Generated copies */}
          {!isPending && generatedCopies && !errorMessage && (
            <div className="space-y-6">
              {generatedCopies.map((copy, index) => (
                <AdCopyCard key={index} adCopy={copy} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
