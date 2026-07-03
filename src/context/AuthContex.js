import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [mobile,  setMobile] = useState('');
    const [password, setPassword] = useState(null);
    const [userID, setUserID] = useState(null);
    const [userName, setUserName] = useState(null);

    return (
        <AuthContext.Provider value={{
            mobile,setMobile,
            userID,setUserID,
            password,setPassword,
            userName, setUserName
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
