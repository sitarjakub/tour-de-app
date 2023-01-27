import React, { useContext, useEffect, useState } from 'react';

type AuthContextParams = {
    user:string|null,
    setUser:(u:string|null) => void
};

const AuthContext = React.createContext<AuthContextParams>({user: localStorage.getItem('user'), setUser: (u)=>{}});

export function useUser(){
    return useContext(AuthContext);
}

export function AuthProvider({children}:{children:React.ReactNode}){
    const [userContext, setUserContext] = useState<string|null>(localStorage.getItem('user'));

    useEffect(()=>{
        if(userContext){
            localStorage.setItem('user', userContext);
        }else{
            localStorage.removeItem('user');
        }
    }, [userContext])

    return (
        <AuthContext.Provider value={{user: userContext, setUser: setUserContext}}>
            {children}
        </AuthContext.Provider>
    )
}