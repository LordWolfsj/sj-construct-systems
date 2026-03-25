import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario_sistema");
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = (data) => {
    setUsuario(data);
    localStorage.setItem("usuario_sistema", JSON.stringify(data));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario_sistema");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}