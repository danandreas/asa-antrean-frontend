"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "./api";
import { User } from "./types";
import toast from "react-hot-toast";
import { removeFcmToken } from "@/hooks/useFcm";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = window.localStorage.getItem("pq_user");
    const storedToken = window.localStorage.getItem("pq_token");

    if (storedUser && storedToken) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem("pq_user");
      }
    }
    setIsLoading(false);
  }, []);

  function persistUser(nextUser: User) {
    setUserState(nextUser);
    window.localStorage.setItem("pq_user", JSON.stringify(nextUser));
  }

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      window.localStorage.setItem("pq_token", data.token);
      persistUser(data.user);
      toast.success("Berhasil masuk. Selamat datang kembali!");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      return false;
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      window.localStorage.setItem("pq_token", data.token);
      persistUser(data.user);
      toast.success("Akun berhasil dibuat.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      return false;
    }
  }

  async function logout() {
    await removeFcmToken();
    try {
      await api.post("/auth/logout");
    } catch {
      // Tetap lanjut hapus sesi lokal walau request logout gagal
    } finally {
      window.localStorage.removeItem("pq_token");
      window.localStorage.removeItem("pq_user");
      setUserState(null);
      toast.success("Berhasil keluar.");
      router.replace("/login");
    }
  }

  async function refreshUser() {
    try {
      const { data } = await api.get("/auth/me");
      persistUser(data.user);
    } catch {
      // diamkan; interceptor 401 sudah menangani redirect kalau token invalid
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role?.code === "admin",
        login,
        register,
        logout,
        refreshUser,
        setUser: persistUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return ctx;
}
