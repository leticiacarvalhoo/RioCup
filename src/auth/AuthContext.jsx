import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // TODO: trocar por login real quando o backend existir
  async function signIn() {
    return { error: "backend" };
  }

  // Só funciona em desenvolvimento (npm run dev). Não existe no site publicado.
  function previewAdmin() {
    if (import.meta.env.DEV) {
      setUser({ email: "vorschau@riocup.local", role: "admin" });
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, previewAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// This hook is intentionally exported alongside the provider for this context.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);