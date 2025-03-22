import { HfInference } from '@huggingface/inference';
import { GenerateAdCopyParams, GeneratedAdCopy } from "@shared/schema";

// We'll need a Hugging Face access token for this
// You can get one from https://huggingface.co/settings/tokens
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Default model for text generation if none specified
const DEFAULT_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";

export async function validateApiKey(): Promise<{ valid: boolean; message?: string }> {
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

    // Create a structured prompt for Hugging Face
    const prompt = `<s>[INST] You are an expert copywriter. Please generate ${variations} creative ad copy variations for the following product:
      
Product Name: ${productName}
Brand Name: ${brandName}
Product Description: ${productDescription}
${keyFeatures ? `Key Features: ${keyFeatures}` : ''}
${ageRange ? `Target Age Range: ${ageRange}` : ''}
${gender ? `Target Gender: ${gender}` : ''}
${interests ? `Target Interests: ${interests}` : ''}
Ad Platform: ${platform}
Tone: ${tone}

Each ad copy should include an attention-grabbing headline and compelling body text.

Format your response as valid JSON with this structure:
[
  {
    "headline": "The attention-grabbing headline",
    "body": "The compelling body text of the ad",
    "platform": "${platform}"
  },
  {
    "headline": "Second headline",
    "body": "Second body",
    "platform": "${platform}"
  }
  // More variations as requested
]

Make sure to include exactly ${variations} variations and return ONLY the JSON array, no additional text. [/INST]</s>`;

    console.log("Calling Hugging Face API to generate ad copy...");
    
    // Call the Hugging Face API to generate ad copy
    const response = await hf.textGeneration({
      model: DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    console.log("Hugging Face API response received");
    
    // Extract the generated text and parse JSON
    const generatedText = response.generated_text;
    
    if (!generatedText) {
      throw new Error("No content received from Hugging Face");
    }
    
    // Log the first 100 characters for debugging
    console.log(`Raw response first 100 chars: "${generatedText.substring(0, 100).replace(/\n/g, '\\n')}..."`);
    
    // Log character codes to identify invisible characters (simpler approach)
    const firstChars = generatedText.substring(0, 20);
    const charCodes = [];
    for (let i = 0; i < firstChars.length; i++) {
      charCodes.push(firstChars.charCodeAt(i));
    }
    console.log(`Character codes for first 20 chars: ${JSON.stringify(charCodes)}`);
    

    // Clean up the response if needed
    let cleanedText = generatedText.trim();
    
    // Sometimes the model adds backticks or other markdown formatting, clean that up
    // Handle both ```json and plain ``` format
    cleanedText = cleanedText.replace(/^\s*```(?:json)?\s*/, '');
    cleanedText = cleanedText.replace(/\s*```\s*$/, '');
    
    // Additional cleanup for backticks at beginning of response
    cleanedText = cleanedText.replace(/^`/, '');
    cleanedText = cleanedText.replace(/`$/, '');
    
    // Find the first open bracket (beginning of JSON array)
    const jsonStartIndex = cleanedText.indexOf('[');
    if (jsonStartIndex > 0) {
      // If there are any characters before the first '[', remove them
      cleanedText = cleanedText.substring(jsonStartIndex);
    }
    
    // Remove any other non-standard characters that could appear at the beginning
    // This will catch things like 'k;', special characters, etc.
    cleanedText = cleanedText.replace(/^[^[\s{]*/g, '');
    
    console.log("Cleaned text before parsing:", cleanedText.substring(0, 100) + "...");
    
    try {
      // Extra safety check - ensure we're starting with a JSON array
      if (!cleanedText.startsWith('[')) {
        throw new Error("Response does not contain a JSON array");
      }
      
      const parsedResponse = JSON.parse(cleanedText);
      
      // Ensure we have an array
      if (!Array.isArray(parsedResponse)) {
        throw new Error("Response is not an array");
      }
      
      // Ensure each item has the right structure
      const validatedResponse = parsedResponse.map((item, index) => {
        if (!item.headline || !item.body) {
          console.warn(`Item at index ${index} is missing required fields`);
          // Provide a fallback for missing fields
          return {
            headline: item.headline || `${brandName} - ${productName}`,
            body: item.body || `Check out our ${productName} from ${brandName}!`,
            platform
          };
        }
        return {
          headline: item.headline,
          body: item.body,
          platform: item.platform || platform
        };
      });
      
      // Return only up to the requested number of variations
      return validatedResponse.slice(0, variations);
    } catch (parseError) {
      console.error("Failed to parse Hugging Face response:", parseError);
      console.log("Raw response:", cleanedText);
      throw new Error("Invalid response format from Hugging Face");
    }
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