import React, { useEffect, useState, createContext, useContext } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { UserDetailContext } from './context/UserDetailContext';

function Provider({children}) {
  const {user}=useUser();
  const createUserMutation = useMutation(api.users.CreateNewUser);
  const [UserDetail,setUserDetail]=useState();
  
  useEffect(()=>{
    if (user) {
      console.log('User found:', user);
      console.log('API object:', api);
      console.log('Users API:', api.users);
      CreateNewUser();
    }
  },[user])

  const CreateNewUser=async()=>{
    try {
      console.log('Attempting to create user...');
      console.log('Mutation function type:', typeof createUserMutation);
      console.log('Mutation function:', createUserMutation);
      
      const result = await createUserMutation({
        name: user?.fullName ?? '',
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        imageUrl: user?.imageUrl ?? ''
      });
      console.log('User creation result:', result);
      setUserDetail(result);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  return (
    <div>
      <UserDetailContext.Provider value={{ UserDetail,setUserDetail }}>
        {children}
      </UserDetailContext.Provider>
    </div>
  )
}

export default Provider

export const useUserDetailContext = () => {
  return useContext(UserDetailContext);
}