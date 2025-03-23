import { AdCopyGenerator } from "@/components/AdCopyGenerator";
import { AdCopyHistory } from "@/components/AdCopyHistory";
import { ApiKeyStatus } from "@/components/ApiKeyStatus";
import { Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">CopAd</h1>
            </div>
            {/* User avatar */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">AB</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Status */}
        <ApiKeyStatus />
        
        <div className="grid grid-cols-1 gap-8">
          {/* Generator Form */}
          <AdCopyGenerator />
          
          {/* History Section */}
          <AdCopyHistory />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Layers className="h-5 w-5 text-primary" />
              <span className="ml-2 text-sm text-gray-500">Ad Copy Generator</span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">Powered by Hugging Face API • <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
