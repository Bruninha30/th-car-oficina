import React, { useState, useEffect } from "react";

export default function ClienteForm({ cliente, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        telefone: cliente.telefone || "",
        email: cliente.email || "",
        endereco: cliente.endereco || "",
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        endereco: "",
      });
    }
  }, [cliente]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome é obrigatório.");
      return;
    }
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="clientes-form">
      <input
        type="text"
        name="nome"
        placeholder="Nome *"
        value={formData.nome}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="telefone"
        placeholder="Telefone"
        value={formData.telefone}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="text"
        name="endereco"
        placeholder="Endereço"
        value={formData.endereco}
        onChange={handleChange}
      />

      <div className="botoes-clientes">
        <button type="submit">Salvar</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancelar">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
