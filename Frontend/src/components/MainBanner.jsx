import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {
  return (
    <div className='relative'>
  {/* Banner Images */}
  <img src={assets.main_banner_bg} alt="banner" className='w-full hidden md:block' />
  <img src={assets.main_banner_bg_sm} alt="banner" className='w-full md:hidden' />

  {/* Text & Buttons Container */}
  <div className='absolute top-0 left-0 h-full flex flex-col justify-center px-4 md:px-18 lg:px-24'>
    <h1 className='text-3xl md:text-3xl lg:text-5xl font-bold text-left max-w-72 md:max-w-80 lg:max-w-105 leading-tight lg:leading-15'>
      Freshness You Can Trust, Savings You will Love!
    </h1>

    <div className='flex items-center gap-4 mt-6 font-medium'>
      <Link
        to={"/products"}
        className="group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer"
      >
        Shop Now
        <img
          className='md:hidden transition group-focus:translate-x-1'
          src={assets.white_arrow_icon}
          alt="arrow"
        />
      </Link>

      <Link
        to={"/products"}
        className="group hidden md:flex items-center gap-2 cursor-pointer"
      >
        Explore deals
        <img
          className='transition group-hover:translate-x-1'
          src={assets.black_arrow_icon}
          alt="arrow"
        />
      </Link>
    </div>
  </div>
</div>

  )
}

export default MainBanner
