import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import interviewImage from '../../../public/interview.jpg'
import CreateInterviewDialog from "../_components/CreateInterviewDialog"

function EmptyState(){
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className='mt-14 flex flex-col items-center gap-5 border-dashed p-10 border-4 rounded-2xl bg-gray-50'>
        <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className='mt-2 text-lg text-gray-500'>You don't have any interviews created</h2>
        <Button size="lg">+ Create interview</Button>
      </div>
    );
  }

  return (
    <div className='mt-14 flex flex-col items-center gap-5 border-dashed p-10 border-4 rounded-2xl bg-gray-50'>
      <Image src={interviewImage} alt='emptyState'
      width={130}
      height={130}
      style={{ width: 'auto', height: 'auto', maxWidth: '130px', maxHeight: '130px' }}
      className="object-contain"
      />
      <h2 className='mt-2 text-lg text-gray-500'>You don't have any interviews created</h2>
      <CreateInterviewDialog/>
    </div>
  )
}

export default EmptyState
