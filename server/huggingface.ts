import { HfInference } from '@huggingface/inference';
import { GenerateAdCopyParams, GeneratedAdCopy } from "@shared/schema";

// We'll need a Hugging Face access token for this
// You can get one from https://huggingface.co/settings/tokens
const apiKey = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(apiKey);

// Use a more reliable and accessible model
const DEFAULT_MODEL = "google/flan-t5-large";

export async function validateApiKey(): Promise<{ valid: boolean; message?: string }> {
  if (!apiKey) {
    return { 
      valid: false, 
      message: "No Hugging Face API key found. Please set the HUGGINGFACE_API_KEY environment variable." 
    };
  }

  try {
    // Make a minimal API call to validate the key
    await hf.textGeneration({
      model: DEFAULT_MODEL,
      inputs: "Hello",
      parameters: {
        max_new_tokens: 5,
        return_full_text: false
      }
    });
    return { valid: true };
  } catch (error: any) {
    console.error("Hugging Face API key validation error:", error);
    
    let message = "Failed to validate Hugging Face API key";
    
    // Specific error handling
    if (error?.message?.includes('Unauthorized')) {
      return { 
        valid: false, 
        message: "Invalid Hugging Face API key. Please check your API key and try again." 
      };
    } else if (error?.message?.includes('rate limit')) {
      return { 
        valid: false, 
        message: "Hugging Face API rate limit exceeded. Please try again later." 
      };
    }
    
    return { valid: false, message };
  }
}

export async function generateAdCopy(params: GenerateAdCopyParams): Promise<GeneratedAdCopy[]> {
  try {
    // Validate API key before making the main request
    const keyValidation = await validateApiKey();
    if (!keyValidation.valid) {
      throw new Error(keyValidation.message || "Invalid Hugging Face API key");
    }
    
    const {
      productName,
      brandName,
      productDescription,
      keyFeatures,
      ageRange,
      gender,
      interests,
      tone,
      platform,
      variations,
    } = params;

    // Create a simpler prompt for the model
    const prompt = `Generate ${variations} ad copies for ${productName} by ${brandName}. Description: ${productDescription}. Features: ${keyFeatures || 'N/A'}. Target: ${ageRange || 'All ages'}, ${gender || 'All genders'}, Interests: ${interests || 'General'}. Platform: ${platform}. Tone: ${tone}.`;

    console.log("Calling Hugging Face API with prompt:", prompt);
    
    // Call the Hugging Face API with simpler parameters
    const response = await hf.textGeneration({
      model: DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    console.log("Hugging Face API response received");
    
    // Extract the generated text
    const generatedText = response.generated_text;
    
    if (!generatedText) {
      throw new Error("No content received from Hugging Face");
    }
    
    console.log("Generated text:", generatedText);
    
    // Parse the generated text into ad copies
    // Since we're using a simpler model, we'll parse the text manually
    const adCopies: GeneratedAdCopy[] = [];
    
    // Split the text by newlines or numbering patterns
    const sections = generatedText.split(/\n+|\d+\.\s+/);
    
    for (let i = 0; i < Math.min(variations, sections.length); i++) {
      const section = sections[i].trim();
      if (section) {
        // Try to extract headline and body
        const parts = section.split(/:\s+|\n+/);
        let headline = productName;
        let body = section;
        
        if (parts.length >= 2) {
          headline = parts[0].trim();
          body = parts.slice(1).join(" ").trim();
        }
        
        adCopies.push({
          headline: headline || `${brandName} - ${productName}`,
          body: body || `Check out our ${productName} from ${brandName}!`,
          platform
        });
      }
    }
    
    // If we couldn't parse enough ad copies, generate some generic ones
    while (adCopies.length < variations) {
      adCopies.push({
        headline: `${brandName} - ${productName}`,
        body: `Check out our amazing ${productName} from ${brandName}! ${productDescription}`,
        platform
      });
    }
    
    return adCopies;
  } catch (error: any) {
    console.error("Error generating ad copy:", error);
    
    // Specific error handling
    if (error?.message?.includes('Unauthorized')) {
      throw new Error('Invalid Hugging Face API key. Please check your API key and try again.');
    }
    
    if (error?.message?.includes('rate limit')) {
      throw new Error('Hugging Face API rate limit exceeded. Please try again later.');
    }
    
    // Generic error handler
    throw new Error(`Failed to generate ad copy: ${error.message || 'Unknown error'}`);
  }
}