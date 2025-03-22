import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { useQuery } from "@tanstack/react-query";

export function ApiKeyStatus() {
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Check if Hugging Face API key is valid
  const { isLoading, data, error } = useQuery({
    queryKey: ['/api/check-api-key'],
    queryFn: async () => {
      const response = await fetch('/api/check-api-key');
      return response.json();
    }
  });

  useEffect(() => {
    if (data) {
      setApiKeyStatus({
        valid: data.success,
        message: data.message || 'API key status unknown'
      });
    } else if (error) {
      setApiKeyStatus({
        valid: false,
        message: error instanceof Error ? error.message : 'Failed to check API key status'
      });
    }
  }, [data, error]);

  if (isLoading || !apiKeyStatus) {
    return null;
  }

  return (
    <>
      {!apiKeyStatus.valid && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex flex-col gap-2">
            <p><strong>Hugging Face API Error:</strong> {apiKeyStatus.message}</p>
            <p className="text-sm">
              Please make sure your Hugging Face API key is properly set. You can get an API key from 
              https://huggingface.co/settings/tokens
            </p>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}