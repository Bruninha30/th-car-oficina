import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./SignUp.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    // 1. Criação do usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error || !data.user) {
      setErro("Erro ao cadastrar: " + (error?.message || "Dados inválidos."));
      return;
    }

    // 2. Autentica o usuário após cadastro
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError) {
      setErro("Erro ao autenticar: " + loginError.message);
      return;
    }

    // 3. Obtém o ID do usuário autenticado
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setErro("Usuário não encontrado após login.");
      return;
    }

    // 4. Inserção do perfil na tabela 'usuarios'
    const { error: perfilError } = await supabase
      .from("usuarios")
      .insert([{ id: userId, cargo: "funcionario" }]);

    if (perfilError) {
      setErro("Erro ao registrar perfil: " + perfilError.message);
      return;
    }

    // 5. Sucesso
    setSucesso("Cadastro realizado com sucesso! Redirecionando...");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="signup-container">
      <h2>Criar Conta</h2>
      {erro && <p className="erro">{erro}</p>}
      {sucesso && <p className="sucesso">{sucesso}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}