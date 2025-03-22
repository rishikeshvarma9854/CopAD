import OpenAI from "openai";
import { GenerateAdCopyParams, GeneratedAdCopy } from "@shared/schema";

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function validateApiKey(): Promise<{ valid: boolean; message?: string }> {
  try {
    // Make a minimal API call to validate the key
    await openai.models.list({ limit: 1 });
    return { valid: true };
  } catch (error: any) {
    console.error("OpenAI API key validation error:", error);
    
    let message = "Failed to validate OpenAI API key";
    
    // Specific OpenAI error handling
    if (error?.status === 401) {
      return { 
        valid: false, 
        message: "Invalid API key. Please check your API key and try again." 
      };
    } else if (error?.status === 429) {
      return { 
        valid: false, 
        message: "OpenAI API rate limit exceeded. Please try again later or update your API key." 
      };
    } else if (error?.error?.code === 'insufficient_quota') {
      return { 
        valid: false, 
        message: "OpenAI API quota exceeded. Please check your API key billing details or update to a new key." 
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
      throw new Error(keyValidation.message || "Invalid OpenAI API key");
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

    // Create a structured prompt for the OpenAI API
    const prompt = `
      Generate ${variations} creative ad copy variations for the following product:
      
      Product Name: ${productName}
      Brand Name: ${brandName}
      Product Description: ${productDescription}
      ${keyFeatures ? `Key Features: ${keyFeatures}` : ''}
      ${ageRange ? `Target Age Range: ${ageRange}` : ''}
      ${gender ? `Target Gender: ${gender}` : ''}
      ${interests ? `Target Interests: ${interests}` : ''}
      Ad Platform: ${platform}
      Tone: ${tone}
      
      Please create ad copies that would be effective for the specified platform and target audience.
      Each ad copy should include an attention-grabbing headline and compelling body text.
      
      Please format your response as a JSON array of objects with the following structure:
      [
        {
          "headline": "The attention-grabbing headline",
          "body": "The compelling body text of the ad",
          "platform": "${platform}"
        }
      ]
    `;

    console.log("Calling OpenAI API to generate ad copy...");
    
    // Call the OpenAI API to generate ad copy
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the newest model
      messages: [
        {
          role: "system",
          content: "You are an expert copywriter specializing in creating engaging and persuasive ad copies for various platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Add some creativity but keep it focused
      max_tokens: 1500, // Adjust based on the length of response needed
    });

    console.log("OpenAI API response received successfully");
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    // Ensure we have the expected array format
    if (!Array.isArray(parsedResponse)) {
      console.log("Response format:", parsedResponse);
      if (parsedResponse.adCopies && Array.isArray(parsedResponse.adCopies)) {
        return parsedResponse.adCopies;
      }
      throw new Error("Unexpected response format from OpenAI");
    }

    return parsedResponse;
  } catch (error: any) {
    console.error("Error generating ad copy:", error);
    
    // Specific error handling for OpenAI API quota errors
    if (error?.status === 429) {
      if (error?.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your API key billing details or update to a new key.');
      }
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    // Handle authentication errors
    if (error?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    }
    
    // Handle other API-related errors
    if (error?.status) {
      throw new Error(`OpenAI API error (${error.status}): ${error.message || 'Unknown error'}`);
    }
    
    // Generic error handler
    throw new Error(`Failed to generate ad copy: ${error.message || 'Unknown error'}`);
  }
}
