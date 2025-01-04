'use client'
import { useAuth } from '@/app/context/Authcontext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface productType{
  id:number,
  title:string,
  description:string,
  price:number,
  images:string
}
const dashboard = () => {
    const[products,setProducts]=useState([]);
    const{isAuthenticate}=useAuth();
    const router =useRouter();
    useEffect(()=>{
      if(isAuthenticate)
      {
      const fetchproduct= async()=> await fetch('https://dummyjson.com/products')
      .then(res => res.json())
      .then(data=>setProducts(data.products))   
      
      fetchproduct();
      }else{
        router.push('/admin/login');
      }
    },[])
    console.log(products)
  return (
    <div className="px-20 text-black w-full justify-items-center py-20">
        <div>
          <table className='border-2  border-black border-collapse table-fixed '>
            <thead>
              <tr>
                <th className='border-2  border-black p-2'>Title</th>
                <th className='border-2  border-black p-2'>Description</th>
                <th className='border-2  border-black p-2'>Price</th>
                <th className='border-2  border-black p-2'>Image</th>
              </tr>
            </thead>
            <tbody>
              {
                products?.map((product:productType)=>
                  <tr key={product.id}>
                    <td className='border-2  border-black p-2 w-60 '>{product.title}</td>
                    <td className='border-2  border-black p-2 w-60 '>{product.description}</td>
                    <td className='border-2  border-black p-2 w-60 '>{product.price}</td>
                    <td className='border-2  border-black p-2 w-60 '><img className='w-40 h-40' src={product.images[0]}/></td>
                  </tr>
                  )
              }
              
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default dashboard