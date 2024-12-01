import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuthContext() {
   return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [otpVerified, setOtpVerified] = useState(false);
   const [manager, setManager] = useState(null);
   const [tillAccess, setTillAccess] = useState(false);
   const [isGuest, setIsGuest] = useState(true);

   const value = {
      user,
      setUser,
      isGuest,
      setIsGuest,
      tillAccess,
      setTillAccess,
      manager,
      setManager,
      otpVerified,
      setOtpVerified,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
