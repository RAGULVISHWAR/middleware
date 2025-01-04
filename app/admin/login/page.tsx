'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const login = () => {
  const [email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const router = useRouter();
  const logintoken =async()=>{
    try{
       const res = await fetch('/api/auth/token',{
        method:'POST',
        body:JSON.stringify({email,password})
      })
      if (res.ok) {
        const token = await res.json();
        console.log(token);
       }
     }
     catch(err)
     {
      return alert( `${err}`);
     } 
   }
  const handlesubmit=(e:React.FormEvent)=>{
    console.log("hello",process.env.NEXT_PUBLIC_SECRET_KEY);
     e.preventDefault();
    
        if(!email || !password)
        {
          return alert("Email and Password is required");
        }
        else{
          logintoken();
        }
  }

 
  // console.log(password);
  return (
    <div className="text-black place-items-center p-10">
       <div className='border border-gray-600  px-5 py-5 space-y-4 rounded-2xl w-80'>
          <p className='text-3xl font-medium place-self-start'>Sign in</p>
          <form onSubmit={handlesubmit} className='space-y-4'>
              <div className='space-y-1'>
                <label>Email </label><br/>
                <input type='text' value={email} onChange={(e)=>setEmail(e.target.value)} className='border border-gray-400 w-full p-2' ></input>
              </div>
              <div className='space-y-1'>
                <label>Password</label><br/>
                <input type='text' value={password} onChange={(e)=>setPassword(e.target.value)} className='border border-gray-400 w-full p-2' ></input>
              </div>
              <div>
                 <button type='submit' className='w-full border border-gray-600 rounded-full p-2 text-white bg-gray-800 active:scale-105 transition-transform duration-100'>Signin</button>
              </div>
          </form>
       </div>
    </div>
  )
}

export default login