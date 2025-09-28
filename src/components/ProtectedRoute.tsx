import { Outlet, Navigate } from "react-router-dom";
// import useUserStore from "@/store/useUserStore";
// import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  // const {setCurrentUser} = useUserStore()
  // const [authFailed, setAuthFailed] = useState(false)
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const user = await setCurrentUser(localStorage.getItem('userId'))
  //      if(user) {
  //       setAuthFailed(false)
  //     } else {
  //       setAuthFailed(true)
  //     }
  //     setLoading(false)
  //   }
  //   checkAuth()
  // }, [])

  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  
  // if(authFailed) return <Navigate to={'/login'} replace/> 

  return <Outlet/>
}