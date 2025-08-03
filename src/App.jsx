import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

import { isAdmin } from "./utils/auth";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp"; // novo!
import Clientes from "./pages/Clientes";
import Veiculos from "./pages/Veiculos";
import OrdemServico from "./pages/OrdemServico";
import Dashboard from "./pages/Dashboard";
import HistoricoOS from "./pages/HistoricoOS";
import Relatorio from "./pages/Relatorio";
import Usuario from "./pages/Usuario";
import Sidebar from "./components/Sidebar";

function MainApp({ user, onLogout }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar user={user} onLogout={onLogout} />
      <main style={{ marginLeft: 220, padding: 20, flexGrow: 1 }}>
        <Routes>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/ordem-servico" element={<OrdemServico />} />

          {isAdmin(user) && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes/:id/historico" element={<HistoricoOS />} />
              <Route path="/relatorio" element={<Relatorio />} />
              <Route path="/usuario" element={<Usuario />} />
            </>
          )}

          <Route
            path="*"
            element={
              isAdmin(user)
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/clientes" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      setUser(JSON.parse(userStorage));
      setCarregando(false);
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        try {
          const { data: perfil, error: perfilError } = await supabase
            .from("usuarios")
            .select("tipo")
            .eq("id", data.user.id)
            .single();

          if (perfilError || !perfil) {
            console.error("Erro ao buscar perfil:", perfilError);
            setUser(null);
            localStorage.removeItem("user");
            setCarregando(false);
            return;
          }

          const usuario = {
            id: data.user.id,
            tipo: perfil.tipo || "funcionario",
          };

          setUser(usuario);
          localStorage.setItem("user", JSON.stringify(usuario));
        } catch (error) {
          console.error("Erro inesperado:", error);
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setCarregando(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleLogin = (usuario) => {
    setUser(usuario);
    localStorage.setItem("user", JSON.stringify(usuario));
  };

  if (carregando) {
    return <div className="carregando">Carregando sessão...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/cadastro" element={<SignUp />} />

        {/* 👇 Redireciona para cadastro se não estiver logado */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to={isAdmin(user) ? "/dashboard" : "/clientes"} replace />
              : <Navigate to="/cadastro" replace />
          }
        />

        <Route
          path="*"
          element={
            user
              ? <MainApp user={user} onLogout={handleLogout} />
              : <Navigate to="/cadastro" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}