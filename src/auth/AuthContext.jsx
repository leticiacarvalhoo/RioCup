import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

async function isAdmin(userId) {
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

// `user` só existe se a pessoa estiver logada E estiver na tabela admins.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async (session) => {
      setUser(session && (await isAdmin(session.user.id)) ? session.user : null);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session)).finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => check(session), 0); // evita travar dentro do callback do Supabase
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "invalid" };
    if (!(await isAdmin(data.user.id))) {
      await supabase.auth.signOut();
      return { error: "forbidden" };
    }
    setUser(data.user);
    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}
