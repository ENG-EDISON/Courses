import React,{createContext,useState,useContext,useEffect, Children} from "react";
import { getMyProfile } from "../api/ProfileApis";
const AuthContext=createContext();
export const useAuth=()=>{
  return useContext(AuthContext);
}

export const AuthProvider=({Children})=>{
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [user,setUser]=useState(false);
  const [isLoading,setIsLoading]=useState(false);

  useEffect(()=>{
    checkAuth();
  },[])
  const checkAuth=async()=>{
    try{
      const response=await getMyProfile();
      if(response.status==200)
      {
        setIsLoggedIn(true)
        setUser(response.data);
      }
    }
    catch(error){
      setIsLoading(false);
      setUser(null);
    }
    finally{
      setIsLoading(false);
    }
  };
  const login=(userData)=>{
    setIsLoggedIn(true);
    setUser(userData);
  };
  const logout=()=>{
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUser(null);
  };
  const value={
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };
  return(
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}