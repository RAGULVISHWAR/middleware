'use client'
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'


interface AuthcontextType
{
   isAuthenticate:boolean;
   login:(token:string)=>void;
   logout:()=>void
}


const Authcontext =createContext<AuthcontextType | undefined>(undefined);

export const AuthProvider:React.FC<{children:ReactNode}> = ({children})=>{
     
     const [isAuthenticate,setIsAuthenticate]=useState(true);
     const router =useRouter();
     useEffect(()=>{
       const token =localStorage.getItem('token');
       if(token)
       {
         fetch('/api/auth/validate',{
             method:'POST',
             headers:{
               Authorization:`Brear ${token}`
             }
         }).then((res)=>{
          if(res.ok)
          {
            setIsAuthenticate(true);
          }
          else{
            setIsAuthenticate(false);
            localStorage.removeItem('token');
            router.push('/admin/login');
          }
         }).catch(()=>{
            setIsAuthenticate(false);
            localStorage.removeItem('token');
            router.push('/admin/login');
         })
       }

     },[router])

     const login=(token:string)=>{
      localStorage.setItem('token',token);
      setIsAuthenticate(true);
      router.push('/admin/dashboard');
     }

     const logout=()=>{
      localStorage.removeItem('token');
      setIsAuthenticate(false);
      router.push('/admin/login');
     }
  return(
    <Authcontext.Provider value={{isAuthenticate,login,logout}}>
      {children}
    </Authcontext.Provider>
  );
}

export const useAuth =()=>{
  const context = useContext(Authcontext);
  if(!context)
  {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}