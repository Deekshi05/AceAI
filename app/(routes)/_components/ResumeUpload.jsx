"use client"
import React, { useState } from 'react'
import {FileUpload} from "@/components/ui/file-upload"; 
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function ResumeUpload({setFiles, onHandleInputChange}) {
  // const [files, setFiles] = useState([]);
  const handleFileUpload = (files) => {
    setFiles(files[0]);
    console.log(files);
  };
  return (
    <div className="space-y-6">
      <div className="w-full max-w-2xl mx-auto min-h-70 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={handleFileUpload} />
      </div>
      
      {/* Optional Job Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Details (Optional - helps generate more targeted questions)
        </h3>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Job Title</label>
          <Input 
            placeholder="e.g., Full Stack Developer, Data Scientist" 
            onChange={(e)=>onHandleInputChange('jobTitle',e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Job Description</label>
          <Textarea 
            placeholder="Enter or paste the job description (optional)" 
            className='h-[120px]' 
            onChange={(e)=>onHandleInputChange('jobDescription',e.target.value)} 
          />
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload
