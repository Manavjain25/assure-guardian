// context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type UserRole = 'user' | 'agent' | null;

interface UserContextType {
  userId: string | null;
  role: UserRole;
  loading: boolean;
  setUser: (id: string, role: UserRole) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  role: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (id: string, role: UserRole) => {
    setUserId(id);
    setRole(role);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setRole(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setUser(session.user.id, data.role);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ userId, role, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
