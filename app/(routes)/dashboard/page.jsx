"use client"
import React from 'react'
import {useUser} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import EmptyState from './EmptyState'
import CreateInterviewDialog from '../_components/CreateInterviewDialog'

function dashboard() {
  const {user, isLoaded} = useUser();
  const [interviewList,setInterviewList]=useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) {
    return (
      <div className='py-20 px-10 md:px-28 lg:px-44 xl:px-56'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-lg text-gray-500'> My Dashboard</h2>
            <h2 className='text-3xl font-bold'>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='py-20 px-10 md:px-28 lg:px-44 xl:px-56'>
      <div className='flex justify-between items-center'>
      <div>
      <h2 className='text-lg text-gray-500'> My Dashboard</h2 >
      <h2 className='text-3xl font-bold'>Welcome, {user?.fullName || user?.firstName || 'User'}</h2>
     </div>
     <CreateInterviewDialog />
    </div>
    {
      interviewList.length == 0 && <EmptyState />
    }
    </div>
  )
}

export default dashboard
