import React from 'react'
import {PricingTable} from '@clerk/nextjs'

function upgrade () {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}
    className='flex flex-col mt-24 items-center justify-between'>
      <h2 className='font-bold text-3xl mt-24 mb-10'>Upgrade to Pro Plan</h2>
       <PricingTable />
    </div>
  )
}

export default upgrade 
