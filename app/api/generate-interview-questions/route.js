import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { aj } from '@/utils/arcjet';
import ImageKit from 'imagekit';
import axios from 'axios';
import {auth,currentUser} from "@clerk/nextjs/server";

// Initialize ImageKit
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
  try {
    // Parse the form data
    const user=await currentUser();
    const formData = await request.formData();
    const file = formData.get('file');
    const jobTitle = formData.get('jobTitle');
    const jobDescription = formData.get('jobDescription');
    const {has}=await auth();
    // Clean up empty strings from frontend
    const cleanJobTitle = jobTitle && jobTitle.trim() !== '' ? jobTitle.trim() : null;
    const cleanJobDescription = jobDescription && jobDescription.trim() !== '' ? jobDescription.trim() : null;
    
    let uploadResponse = null;
    let webhookPayload = {};
    
  const decision=await aj.protect(request,{userId:user?.primaryEmailAddress?.emailAddress??'',requested:5});

  console.log(decision);
  const isSubscribedUser=has({plan:'pro'});

  if(decision?.reason?.remaining==0&&!isSubscribedUser){
    return NextResponse.json({
      success: false,
      error: 'Rate limit exceeded',
      questions: null,
    });
  }


    // Send the data to your n8n webhook
    // TODO: Update this URL to match your actual n8n webhook URL
    // You can find this in your n8n workflow by checking the webhook node
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/generate-interview-questions';
    
    // Check if n8n service is reachable first
    try {
      await axios.get('http://localhost:5678/healthz', { timeout: 5000 });
    } catch (healthError) {
      console.error('n8n service is not reachable:', healthError.message);
      return NextResponse.json({
        success: false,
        error: 'n8n service is not running. Please start n8n service using: docker-compose up -d',
        questions: null,
      });
    }

    // Check if we have a valid file (not empty string)
    const hasValidFile = file && file.size > 0 && file.name && file.name.trim() !== '';

    if (hasValidFile) {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to ImageKit
      uploadResponse = await imageKit.upload({
        file: buffer,
        fileName: file.name,
        folder: '/resumes/',
      });
    
      console.log('File uploaded to ImageKit:', uploadResponse.url);
      
      // Prepare webhook payload with resume URL
      webhookPayload = {
        resumeUrl: uploadResponse.url,
        fileName: file.name,
        jobTitle: cleanJobTitle,
        jobDescription: cleanJobDescription,
      };
      
      console.log('Generating questions based on resume', cleanJobTitle || cleanJobDescription ? 'with additional job details' : '');
    } else {
      // Prepare webhook payload with job details only
      webhookPayload = {
        resumeUrl: null,
        fileName: null,
        jobTitle: cleanJobTitle,
        jobDescription: cleanJobDescription,
      };
      
      console.log('Generating questions based on job title and description only');
    }
    
    try {
      const n8nResponse = await axios.post(n8nWebhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // Increased to 2 minutes timeout for AI processing
      });

      console.log('n8n response received');
      console.log('Type of response:', typeof n8nResponse.data);
      console.log('Is array:', Array.isArray(n8nResponse.data));
      console.log('Number of questions:', n8nResponse.data?.length);

      // Extract questions and answers from the array structure
      const interviewQuestions = n8nResponse.data;

      // Log first question to verify structure
      if (interviewQuestions && interviewQuestions.length > 0) {
        console.log('First question sample:', {
          question: interviewQuestions[0].question?.substring(0, 100) + '...',
          answer: interviewQuestions[0].answer?.substring(0, 100) + '...'
        });
      }

      return NextResponse.json({
        success: true,
        imageKitUrl: uploadResponse?.url || null,
        questions: interviewQuestions,
        processingType: file ? 'resume-based' : 'job-description-based',
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
      
      // Return appropriate response based on whether file was uploaded
      const response = {
        success: false,
        error: `${file ? 'File uploaded but ' : ''}${errorMessage}`,
        n8nError: n8nError.response?.data || n8nError.message,
        suggestions: [
          'Check if n8n is running: docker-compose ps',
          'Start n8n if not running: docker-compose up -d',
          'Verify webhook URL in your n8n workflow',
          'Check n8n logs: docker-compose logs n8n'
        ]
      };

      if (file && uploadResponse) {
        response.imageKitUrl = uploadResponse.url;
      }

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process file and generate questions' },
      { status: 500 }
    );
  }
}
