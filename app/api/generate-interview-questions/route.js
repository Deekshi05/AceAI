import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import axios from 'axios';

// Initialize ImageKit
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to ImageKit
    const uploadResponse = await imageKit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/resumes/',
    });

    console.log('File uploaded to ImageKit:', uploadResponse.url);

    // Send the ImageKit URL to your n8n webhook
    // TODO: Update this URL to match your actual n8n webhook URL
    // You can find this in your n8n workflow by checking the webhook node
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/YOUR_WEBHOOK_ID';
    
    // Check if n8n service is reachable first
    try {
      await axios.get('http://localhost:5678/healthz', { timeout: 5000 });
    } catch (healthError) {
      console.error('n8n service is not reachable:', healthError.message);
      return NextResponse.json({
        success: true,
        imageKitUrl: uploadResponse.url,
        error: 'File uploaded successfully, but n8n service is not running. Please start n8n service using: docker-compose up -d',
        questions: null,
      });
    }
    
    try {
      const n8nResponse = await axios.post(n8nWebhookUrl, {
        resumeUrl: uploadResponse.url,
        fileName: file.name,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // Increased to 2 minutes timeout for AI processing
      });

      console.log('n8n response:', n8nResponse.data);

      return NextResponse.json({
        success: true,
        imageKitUrl: uploadResponse.url,
        questions: n8nResponse.data,
      });
    } catch (n8nError) {
      console.error('n8n webhook error:', n8nError.message);
      
      // Determine the specific error type
      let errorMessage = 'Question generation failed.';
      if (n8nError.code === 'ECONNREFUSED') {
        errorMessage = 'n8n service is not running. Please start it with: docker-compose up -d';
      } else if (n8nError.code === 'ECONNABORTED' || n8nError.message.includes('timeout')) {
        errorMessage = 'Question generation is taking longer than expected. The workflow might be processing in the background.';
      } else if (n8nError.response?.status === 404) {
        errorMessage = 'n8n webhook URL not found. Please check your webhook configuration.';
      }
      
      // Return success with ImageKit URL even if n8n fails
      return NextResponse.json({
        success: true,
        imageKitUrl: uploadResponse.url,
        error: `File uploaded but ${errorMessage}`,
        n8nError: n8nError.response?.data || n8nError.message,
        suggestions: [
          'Check if n8n is running: docker-compose ps',
          'Start n8n if not running: docker-compose up -d',
          'Verify webhook URL in your n8n workflow',
          'Check n8n logs: docker-compose logs n8n'
        ]
      });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process file and generate questions' },
      { status: 500 }
    );
  }
}
