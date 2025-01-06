import React from 'react'
import { useAuth } from '../context/Authcontext'

const logout = () => {
    const {logout}=useAuth();
  return (
    <div>
        <p className='cursor-pointer' onClick={logout}>Logout</p>
    </div>
  )
}

export default logout