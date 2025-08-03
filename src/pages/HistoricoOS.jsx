import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function HistoricoOs({ cliente, fecharModal, atualizarHistorico }) {
  const [historico, setHistorico] = useState([]);
  const [formData, setFormData] = useState({
    servico: "",
    valor: "",
    data: "",
    observacao: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoiza a função para não criar nova referência a cada render
  const carregarHistorico = useCallback(async () => {
    if (!cliente) return;
    const { data, error } = await supabase
      .from("historico")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("data", { ascending: false });
    if (error) {
      setErro("Erro ao carregar histórico.");
      console.error(error);
    } else {
      setHistorico(data);
      setErro("");
    }
  }, [cliente]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    if (!formData.servico.trim()) {
      setErro("O serviço é obrigatório.");
      setLoading(false);
      return;
    }
    if (!formData.data) {
      setErro("A data é obrigatória.");
      setLoading(false);
      return;
    }
    if (!formData.valor || isNaN(parseFloat(formData.valor))) {
      setErro("Informe um valor válido.");
      setLoading(false);
      return;
    }

    const novoRegistro = {
      cliente_id: cliente.id,
      servico: formData.servico,
      valor: parseFloat(formData.valor),
      data: formData.data,
      observacao: formData.observacao,
    };

    try {
      const { error } = await supabase.from("historico").insert([novoRegistro]);
      if (error) throw error;

      setSucesso("Registro salvo com sucesso!");
      setFormData({ servico: "", valor: "", data: "", observacao: "" });
      carregarHistorico();
      atualizarHistorico?.();

      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      setErro("Erro ao salvar histórico.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!cliente) return null;

  return (
    <div className="modal-fundo" onClick={fecharModal}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        <h3>Histórico do cliente: {cliente.nome}</h3>
        <button
          className="modal-fechar"
          onClick={(e) => {
            e.stopPropagation();
            fecharModal();
          }}
          aria-label="Fechar modal"
        >
          &times;
        </button>

        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="sucesso">{sucesso}</p>}

        <form onSubmit={handleSubmit} className="form-historico" noValidate>
          <input
            type="text"
            name="servico"
            placeholder="Serviço *"
            value={formData.servico}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="date"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="number"
            step="0.01"
            name="valor"
            placeholder="Valor (R$) *"
            value={formData.valor}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <textarea
            name="observacao"
            placeholder="Observações"
            value={formData.observacao}
            onChange={handleChange}
            rows="3"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            Adicionar Registro
          </button>
        </form>

        <h4>Registros anteriores</h4>
        {historico.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <table className="tabela-historico">
            <thead>
              <tr>
                <th>Data</th>
                <th>Serviço</th>
                <th>Valor (R$)</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.data).toLocaleDateString()}</td>
                  <td>{item.servico}</td>
                  <td>
                    {item.valor !== null && item.valor !== undefined
                      ? item.valor.toFixed(2)
                      : "-"}
                  </td>
                  <td>{item.observacao || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
