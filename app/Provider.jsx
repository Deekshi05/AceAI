import React, { useEffect, useState, createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { UserDetailContext } from "./context/UserDetailContext";

function Provider({ children }) {
  const { user } = useUser();
  const createUserMutation = useMutation(api.users.CreateNewUser);
  const [UserDetail, setUserDetail] = useState();

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const result = await createUserMutation({
        name: user?.fullName ?? "",
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user?.imageUrl ?? "",
      });
      setUserDetail(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  return (
    <div>
      <UserDetailContext.Provider value={{ UserDetail, setUserDetail }}>
        {children}
      </UserDetailContext.Provider>
    </div>
  );
}

export default Provider;

export const useUserDetailContext = () => {
  return useContext(UserDetailContext);
};
