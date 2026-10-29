import React from 'react';
export const AuthContext = React.createContext({ user: null, login: () => {}, logout: () => {} });
export function AuthProvider({ children }) { const [user, setUser] = React.useState(null); const value = { user, login: setUser, logout: () => setUser(null) }; return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
