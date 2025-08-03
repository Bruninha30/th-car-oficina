import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Veiculos.css";

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [placa, setPlaca] = useState("");
  const [ano, setAno] = useState("");
  const [quilometragem, setQuilometragem] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    buscarVeiculos();
    buscarClientes();
  }, []);

  const buscarVeiculos = async () => {
    const { data, error } = await supabase
      .from("veiculos")
      .select("id, cliente_id, modelo, marca, placa, ano, quilometragem, clientes ( nome )");

    if (error) {
      console.error("Erro ao buscar veículos:", error);
      alert("Erro ao buscar veículos. Veja o console para detalhes.");
    } else {
      setVeiculos(data);
    }
  };

  const buscarClientes = async () => {
    const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Erro ao buscar clientes. Veja o console para detalhes.");
    } else {
      setClientes(data);
    }
  };

  const limparFormulario = () => {
    setClienteId("");
    setModelo("");
    setMarca("");
    setPlaca("");
    setAno("");
    setQuilometragem("");
    setEditandoId(null);
  };

  const salvarVeiculo = async () => {
    if (!clienteId || !modelo.trim() || !placa.trim()) {
      alert("Cliente, modelo e placa são obrigatórios.");
      return;
    }

    const dadosVeiculo = {
      cliente_id: clienteId,
      modelo: modelo.trim(),
      marca: marca.trim() || null,
      placa: placa.trim(),
      ano: ano ? Number(ano) : null,
      quilometragem: quilometragem !== "" ? Number(quilometragem) : null,
    };

    try {
      if (editandoId) {
        const { error } = await supabase
          .from("veiculos")
          .update(dadosVeiculo)
          .eq("id", editandoId);

        if (error) {
          console.error("Erro ao atualizar veículo:", error);
          alert("Erro ao atualizar veículo.");
          return;
        }
      } else {
        const { error } = await supabase.from("veiculos").insert(dadosVeiculo);

        if (error) {
          console.error("Erro ao inserir veículo:", error);
          alert("Erro ao inserir veículo.");
          return;
        }
      }
      buscarVeiculos();
      limparFormulario();
    } catch (error) {
      console.error("Erro inesperado ao salvar veículo:", error);
      alert("Erro inesperado ao salvar veículo. Veja o console.");
    }
  };

  const editarVeiculo = (veiculo) => {
    setClienteId(veiculo.cliente_id);
    setModelo(veiculo.modelo || "");
    setMarca(veiculo.marca || "");
    setPlaca(veiculo.placa || "");
    setAno(veiculo.ano !== null ? String(veiculo.ano) : "");
    setQuilometragem(veiculo.quilometragem !== null ? String(veiculo.quilometragem) : "");
    setEditandoId(veiculo.id);
  };

  const excluirVeiculo = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este veículo?")) return;

    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir veículo:", error);
      alert("Erro ao excluir veículo.");
    } else {
      buscarVeiculos();
    }
  };

  return (
    <div className="container-veiculos">
      <h2>Cadastro de Veículos</h2>
      <div className="form-veiculo">
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Modelo *"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
        />
        <input
          type="text"
          placeholder="Placa *"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Ano"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          min="1900"
          max={new Date().getFullYear()}
        />
        <input
          type="number"
          placeholder="Quilometragem (opcional)"
          value={quilometragem}
          onChange={(e) => setQuilometragem(e.target.value)}
          min="0"
        />
        <button onClick={salvarVeiculo}>
          {editandoId ? "Atualizar" : "Cadastrar"}
        </button>
        {editandoId && <button onClick={limparFormulario}>Cancelar</button>}
      </div>

      <table className="tabela-veiculos">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Modelo</th>
            <th>Marca</th>
            <th>Placa</th>
            <th>Ano</th>
            <th>Km</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Nenhum veículo cadastrado.
              </td>
            </tr>
          ) : (
            veiculos.map((veiculo) => (
              <tr key={veiculo.id}>
                <td>{veiculo.clientes?.nome || "-"}</td>
                <td>{veiculo.modelo}</td>
                <td>{veiculo.marca || "-"}</td>
                <td>{veiculo.placa}</td>
                <td>{veiculo.ano || "-"}</td>
                <td>{veiculo.quilometragem !== null ? veiculo.quilometragem : "-"}</td>
                <td>
                  <button onClick={() => editarVeiculo(veiculo)}>Editar</button>
                  <button onClick={() => excluirVeiculo(veiculo.id)}>Excluir</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
