import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data.user) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    // Busca perfil usando o campo 'cargo'
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("cargo")
      .eq("id", data.user.id)
      .single();

    if (perfilError || !perfil) {
      setErro("Erro ao buscar perfil do usuário.");
      return;
    }

    const usuario = {
      id: data.user.id,
      tipo: perfil.cargo || "funcionario",
    };

    onLogin(usuario);
    navigate(perfil.cargo === "admin" ? "/dashboard" : "/clientes");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, textAlign: "center" }}>
      {/* Logo no topo */}
      <img 
        src="/logo-thcar.png" 
        alt="Logo da Oficina" 
        style={{ width: "150px", marginBottom: "20px" }} 
      />

      <h2>Login</h2>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%", padding: 8 }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
