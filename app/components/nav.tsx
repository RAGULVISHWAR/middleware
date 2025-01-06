'use client'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '../context/Authcontext'
import  Logout from './logout' 
const nav = () => {
  const {isAuthenticate}=useAuth();
  return (
    <>
     <div className='w-full flex bg-neutral-900 py-5 px-10 place-content-between'>
        <p className='text-xl font-bold text-white'>
           Admin
        </p>
        <div className='w-[20%] flex place-content-between text-white'>
            <Link href='/'>Home</Link>
            <Link href='/admin/dashboard'>Dashboard</Link>
            {!isAuthenticate && <Link href='/admin/login'>Login</Link>}
            {isAuthenticate && <Logout/> }
        </div>
     </div>
    </>
  )
}

export default nav