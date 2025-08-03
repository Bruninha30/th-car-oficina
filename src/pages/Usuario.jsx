import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Usuario.css";

function FormUser({ onSubmit, onCancel, initialData = {}, loading }) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cargo: "funcionario",
    usuario: "",
    email: "",
    senha: "",
  });

  useEffect(() => {
    setForm({
      nome: initialData.nome || "",
      telefone: initialData.telefone || "",
      cargo: initialData.cargo || "funcionario",
      usuario: initialData.usuario || "",
      email: initialData.email || "",
      senha: "", // senha limpa para edição
    });
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="form-user">
      <input
        name="nome"
        placeholder="Nome"
        value={form.nome}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        name="telefone"
        placeholder="Telefone"
        value={form.telefone}
        onChange={handleChange}
        disabled={loading}
      />
      <select
        name="cargo"
        value={form.cargo}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="funcionario">Funcionário</option>
        <option value="admin">Administrador</option>
      </select>
      <input
        name="usuario"
        placeholder="Usuário"
        value={form.usuario}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        disabled={loading}
      />
      {/* Mostra o campo senha só para cadastro */}
      {!initialData.id && (
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="new-password"
        />
      )}

      <div className="form-buttons">
        <button type="submit" disabled={loading}>
          {loading
            ? "Processando..."
            : initialData.id
            ? "Salvar Alterações"
            : "Cadastrar"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    buscarUsuarios();
  }, []);

  async function buscarUsuarios() {
    setLoading(true);
    setErro("");
    try {
      const { data, error } = await supabase.from("usuarios").select("*");
      if (error) throw error;
      setUsuarios(data);
    } catch (error) {
      setErro("Erro ao buscar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastrarOuEditar(form) {
    setErro("");
    setSucesso("");
    setLoading(true);

    if (!form.nome.trim() || !form.usuario.trim() || !form.email.trim()) {
      setErro("Nome, usuário e email são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      if (editando) {
        const { error } = await supabase
          .from("usuarios")
          .update({
            nome: form.nome,
            telefone: form.telefone,
            cargo: form.cargo,
            usuario: form.usuario,
            email: form.email,
          })
          .eq("id", editando.id);

        if (error) throw error;

        setSucesso("Usuário atualizado com sucesso!");
      } else {
        if (usuarios.some((u) => u.usuario === form.usuario.trim())) {
          setErro("Usuário já existe!");
          setLoading(false);
          return;
        }

        if (!form.senha || form.senha.length < 6) {
          setErro("Senha deve ter pelo menos 6 caracteres.");
          setLoading(false);
          return;
        }

        // Criar usuário no Auth
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: form.email.trim(),
            password: form.senha.trim(),
          });

        if (signUpError) throw signUpError;

        // Inserir perfil na tabela usuarios
        const { error: insertError } = await supabase.from("usuarios").insert([
          {
            id: signUpData.user.id,
            nome: form.nome,
            telefone: form.telefone,
            cargo: form.cargo,
            usuario: form.usuario.trim(),
            email: form.email.trim(),
          },
        ]);

        if (insertError) throw insertError;

        setSucesso(
          "Usuário cadastrado com sucesso! Verifique o e-mail para ativação."
        );
      }

      setEditando(null);
      buscarUsuarios();
    } catch (error) {
      setErro("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirUsuario(id) {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) throw error;
      setSucesso("Usuário excluído com sucesso!");
      buscarUsuarios();
    } catch (error) {
      setErro("Erro ao excluir usuário: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="usuario-container">
      <h1>Gerenciar Usuários</h1>

      {erro && <p className="erro">{erro}</p>}
      {sucesso && <p className="sucesso">{sucesso}</p>}

      <FormUser
        onSubmit={handleCadastrarOuEditar}
        onCancel={() => setEditando(null)}
        initialData={editando || {}}
        loading={loading}
      />

      <h2>Lista de Usuários</h2>
      {loading ? (
        <p>Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <table className="usuario-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Cargo</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.usuario}</td>
                <td>{u.cargo}</td>
                <td>{u.email}</td>
                <td>{u.telefone}</td>
                <td>
                  <button onClick={() => setEditando(u)} disabled={loading}>
                    ✏️
                  </button>{" "}
                  <button onClick={() => excluirUsuario(u.id)} disabled={loading}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
