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

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GenerateAdCopyParams) => {
      const response = await apiRequest('POST', '/api/generate-ad-copy', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedCopies(data.data.copies);
        queryClient.invalidateQueries({ queryKey: ['/api/ad-copy-history'] });
        toast({
          title: "Success!",
          description: "Ad copies generated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate ad copies",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      let errorMessage = "Failed to generate ad copies. Please try again.";
      
      // Check if the error has a response with JSON data
      if (error?.response) {
        try {
          // Try to parse the error response
          error.response.json().then((data: any) => {
            if (data?.message && data.message.includes('OpenAI API quota exceeded')) {
              errorMessage = "Your OpenAI API key has exceeded its quota. Please check your billing details or use a different API key.";
            } else if (data?.message) {
              errorMessage = data.message;
            }
            
            toast({
              title: "API Error",
              description: errorMessage,
              variant: "destructive",
            });
          });
          return; // Return early since we'll handle the toast in the promise
        } catch (e) {
          // If parsing fails, fall back to default message
          console.error("Error parsing error response:", e);
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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

  const shouldShowResults = isPending || generatedCopies;

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
          
          {/* Loading state */}
          {isPending && (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Generating creative ad copies...</p>
            </div>
          )}

          {/* Generated copies */}
          {!isPending && generatedCopies && (
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
