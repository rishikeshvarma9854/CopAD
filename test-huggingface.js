// A simple test script to verify Hugging Face API integration
import { HfInference } from '@huggingface/inference';
import 'dotenv/config';

// Create API client with environment variable
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Define the model to use
const DEFAULT_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";

// A simple test function
async function testHuggingFaceAPI() {
  try {
    console.log('Testing Hugging Face API...');
    
    // Make a simple API call
    const response = await hf.textGeneration({
      model: DEFAULT_MODEL,
      inputs: "Create a short ad for a fictional smartphone called 'TechX Pro'",
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false,
      }
    });
    
    console.log('API call successful!');
    console.log('Generated text:', response.generated_text);
    
    return { success: true, message: 'API call successful', data: response };
  } catch (error) {
    console.error('Error testing Hugging Face API:', error);
    return { 
      success: false, 
      message: error.message || 'Unknown error', 
      error 
    };
  }
}

// Run the test
testHuggingFaceAPI()
  .then(result => {
    if (result.success) {
      console.log('Test completed successfully');
    } else {
      console.error('Test failed:', result.message);
    }
  })
  .catch(err => console.error('Test execution error:', err));