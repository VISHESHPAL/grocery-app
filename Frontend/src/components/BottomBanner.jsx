import React from 'react'
import { assets, features } from '../assets/assets'

const BottomBanner = () => {
  return (
   <div className='relative mt-24'>
  <img src={assets.bottom_banner_image} alt="bottom-banner" className='w-full hidden md:block object-cover max-h-[500px]' />
  <img src={assets.bottom_banner_image_sm} alt="bottom-banner" className='w-full md:hidden object-cover max-h-[500px]' />

  <div className='absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 md:pr-24 bg-black/30'>

    <h1 className='text-2xl md:text-3xl font-semibold text-white mb-6'>Why We are the Best?</h1>

    {
      features.map((feature, index) => (
        <div key={index} className='flex items-start gap-4 mt-4 max-w-md'>
          <img src={feature.icon} alt={feature.title} className='md:w-11 w-9' />
          <div>
            <h3 className='text-base md:text-lg font-semibold text-white'>{feature.title}</h3>
            <p className='text-gray-300 text-xs md:text-sm'>{feature.description}</p>
          </div>
        </div>
      ))
    }

  </div>
</div>

  )
}

export default BottomBanner
