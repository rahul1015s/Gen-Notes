import React from 'react'
import { Squirrel } from 'lucide-react';


const RateLimitedUi = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-8 '>
      <h1 className='text-6xl font-bold text-primary'>You have reached the limit.</h1>
        <Squirrel className='h-45 w-45' />
        <p className='text-shadow-accent text-2xl'>Try after 15 min.</p>
    </div>
  )
}

export default RateLimitedUi
