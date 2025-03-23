import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key from environment
const apiKey = process.env.HUGGINGFACE_API_KEY;
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key first 4 chars:', apiKey ? apiKey.substring(0, 4) : 'none');

// Create Hugging Face inference instance
const hf = new HfInference(apiKey);

// Simple test function
async function testApiKey() {
  try {
    console.log('Testing Hugging Face API key...');
    
    // Make a minimal API call to validate the key
    const response = await hf.textGeneration({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      inputs: "Hello, my name is",
      parameters: {
        max_new_tokens: 10,
        return_full_text: false
      }
    });
    
    console.log('API call successful!');
    console.log('Response:', response);
    return true;
  } catch (error) {
    console.error('API call failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testApiKey()
  .then(success => {
    console.log('Test completed. Success:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
