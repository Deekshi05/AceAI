import React from 'react'

function Provider({children}) {
  const {user}=useUser();
  const CreateUser=useMutation(api.users.CreateNewUser);

  useEffect(()=>{
   user&&CreateNewUser();
  },[user])

  const CreateNewUser=async()=>{
    const result=await CreateUser.mutateAsync({
      name:user?.Fullname??'',
      email:user?.primaryEmailAddress?.emailAddress??'',
      imageUrl:user?.imageUrl
    });
    console.log(result);
  }
  return (
    <div>
      {children}
    </div>
  )
}

export default Provider