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
    <div className="mb-6">
      {/* Hide the API key warning since we're using mock data */}
    </div>
  );
}