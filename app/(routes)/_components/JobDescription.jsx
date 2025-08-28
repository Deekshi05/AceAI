import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
function JobDescription({onHandleInputChange}) {
  return (
    <div >
      <div >
        <label>Job Title</label>
          <Input placeholder="Full Stack Developer" onChange={(e)=>onHandleInputChange('jobTitle',e.target.value)}></Input>
      </div>
      <div className='mt-6'>
        <label>Job Description</label>
        <Textarea placeholder="Enter or paste Job Description" className='h-[200px]' onChange={(e)=>onHandleInputChange('jobDescription',e.target.value)} ></Textarea>
      </div>
    </div>
  )
}

export default JobDescription
