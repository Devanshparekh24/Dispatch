import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userID, setUserID] = useState(null);
    const [password, setPassword] = useState(null);



    return (
        <AuthContext.Provider value={{
            userID,
            setUserID,
            password,
            setPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};



export const useAuth = () => useContext(AuthContext);
