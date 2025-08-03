import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Clientes.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else {
      setClientes(data);
    }
  }

  async function salvarCliente(e) {
    e.preventDefault();

    if (!formData.nome) {
      alert("O nome é obrigatório");
      return;
    }

    if (formData.id) {
      // Atualizar cliente existente
      const { error } = await supabase
        .from("clientes")
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
        })
        .eq("id", formData.id);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        alert("Erro ao atualizar");
        return;
      }
    } else {
      // Cadastrar novo cliente
      const novoCliente = { ...formData };
      delete novoCliente.id;

      const { error } = await supabase
        .from("clientes")
        .insert([novoCliente]);

      if (error) {
        console.error("Erro ao cadastrar cliente:", error);
        alert("Erro ao cadastrar");
        return;
      }
    }

    setFormData({ id: null, nome: "", telefone: "", email: "", endereco: "" });
    buscarClientes();
  }

  function editarCliente(cliente) {
    setFormData(cliente);
  }

  async function excluirCliente(id) {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("Erro ao excluir");
      } else {
        buscarClientes();
      }
    }
  }

  return (
    <div className="clientes-container">
      <h1>Cadastro de Clientes</h1>
      <form onSubmit={salvarCliente} className="form-clientes">
        <input
          type="text"
          placeholder="Nome *"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Endereço"
          value={formData.endereco}
          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
        />
        <button type="submit">
          {formData.id ? "Atualizar" : "Cadastrar"}
        </button>
      </form>

      <h2>Lista de Clientes</h2>
      <ul className="lista-clientes">
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <strong>{cliente.nome}</strong> - {cliente.telefone}<br />
            {cliente.email} | {cliente.endereco}
            <br />
            <button onClick={() => editarCliente(cliente)}>Editar</button>{" "}
            <button onClick={() => excluirCliente(cliente.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
