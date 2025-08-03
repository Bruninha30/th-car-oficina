import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { jsPDF } from "jspdf";
import "./OrdemServico.css";

export default function OrdemServico() {
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [ordens, setOrdens] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [problemaCliente, setProblemaCliente] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [servicosRealizados, setServicosRealizados] = useState("");
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState("Aberta");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    buscarClientes();
    buscarOrdens();
  }, []);

  useEffect(() => {
    if (clienteId) {
      buscarVeiculosPorCliente(clienteId);
    } else {
      setVeiculos([]);
      setVeiculoId("");
    }
  }, [clienteId]);

  async function buscarClientes() {
    const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");
    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else {
      setClientes(data);
    }
  }

  async function buscarVeiculosPorCliente(idCliente) {
    const { data, error } = await supabase
      .from("veiculos")
      .select("id, modelo, placa")
      .eq("cliente_id", idCliente)
      .order("modelo");

    if (error) {
      console.error("Erro ao buscar veículos:", error);
      setVeiculos([]);
    } else {
      setVeiculos(data);
    }
  }

  async function buscarOrdens() {
    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        id,
        data_entrada,
        problema_cliente,
        diagnostico,
        servicos_realizados,
        valor,
        status,
        cliente_id,
        veiculo_id,
        clientes ( nome ),
        veiculos ( modelo, placa )
      `)
      .order("data_entrada", { ascending: false });

    if (error) {
      console.error("Erro ao buscar ordens de serviço:", error);
    } else {
      setOrdens(data);
    }
  }

  async function salvarOrdem(e) {
    e.preventDefault();

    if (!clienteId || !veiculoId || !dataEntrada || !valor) {
      alert("Preencha os campos obrigatórios: cliente, veículo, data e valor.");
      return;
    }

    const dados = {
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      data_entrada: dataEntrada,
      problema_cliente: problemaCliente,
      diagnostico: diagnostico,
      servicos_realizados: servicosRealizados,
      valor: Number(valor),
      status,
    };

    try {
      if (editandoId) {
        const { error } = await supabase
          .from("ordens_servico")
          .update(dados)
          .eq("id", editandoId);

        if (error) {
          alert("Erro ao atualizar ordem de serviço");
          return;
        }
      } else {
        const { error } = await supabase.from("ordens_servico").insert([dados]);
        if (error) {
          alert("Erro ao cadastrar ordem de serviço");
          return;
        }
      }
      limparFormulario();
      buscarOrdens();
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao salvar ordem");
    }
  }

  const editarOrdem = (ordem) => {
    setEditandoId(ordem.id);
    setClienteId(ordem.cliente_id);
    setVeiculoId(ordem.veiculo_id);
    setDataEntrada(ordem.data_entrada);
    setProblemaCliente(ordem.problema_cliente || "");
    setDiagnostico(ordem.diagnostico || "");
    setServicosRealizados(ordem.servicos_realizados || "");
    setValor(ordem.valor);
    setStatus(ordem.status);
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setClienteId("");
    setVeiculoId("");
    setDataEntrada("");
    setProblemaCliente("");
    setDiagnostico("");
    setServicosRealizados("");
    setValor("");
    setStatus("Aberta");
    setVeiculos([]);
  };

  const excluirOrdem = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta ordem de serviço?")) return;

    const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir ordem de serviço");
    } else {
      buscarOrdens();
    }
  };

  // Função para gerar PDF
  const gerarPDF = (ordem) => {
    const doc = new jsPDF();

    const logoUrl = "/logo-thcar.png"; // Coloque a logo no public/ ou troque pelo caminho correto

    const empresa = {
  nome: "TH CAR Mecânica Automotiva",
  cnpj: "53.093.383/0001-56",
  telefone: "(69) 99276-6114",
  email: "thiagocristiane5t@gmail.com",
  endereco: "Rua E05, Bairro Flor de Liz, Vilhena / RO",
    };

    const startX = 10;
    const startY = 10;

    const img = new Image();
    img.src = logoUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      doc.addImage(img, "PNG", startX, startY, 40, 40);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(empresa.nome, 200, 15, { align: "right" });
      doc.text(empresa.endereco, 200, 22, { align: "right" });
      doc.text(`Tel: ${empresa.telefone}`, 200, 29, { align: "right" });
      doc.text(`Email: ${empresa.email}`, 200, 36, { align: "right" });
      doc.text(`CNPJ: ${empresa.cnpj}`, 200, 43, { align: "right" });

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(10, 55, 200, 55);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Ordem de Serviço", 105, 65, null, null, "center");

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      let posY = 75;

      const adicionaLinha = (label, valor) => {
        doc.text(`${label}:`, 15, posY);
        doc.text(String(valor), 55, posY);
        posY += 8;
      };

      adicionaLinha("ID", ordem.id);
      adicionaLinha("Cliente", ordem.clientes?.nome || "-");
      adicionaLinha("Veículo", ordem.veiculos ? `${ordem.veiculos.modelo} (${ordem.veiculos.placa})` : "-");
      adicionaLinha("Data Entrada", ordem.data_entrada);
      adicionaLinha("Problema Cliente", ordem.problema_cliente || "-");
      adicionaLinha("Diagnóstico", ordem.diagnostico || "-");
      adicionaLinha("Serviços Realizados", ordem.servicos_realizados || "-");
      adicionaLinha("Valor (R$)", ordem.valor.toFixed(2));
      adicionaLinha("Status", ordem.status);

      posY += 20;
      doc.line(15, posY, 90, posY);
      doc.text("Assinatura do Cliente", 15, posY + 8);

      doc.line(120, posY, 190, posY);
      doc.text("Data", 120, posY + 8);

      doc.output("dataurlnewwindow");
    };

    img.onerror = () => {
      alert("Erro ao carregar logo para o PDF. Verifique o caminho da imagem.");
    };
  };

  return (
    <div className="ordem-servico-container">
      <h2>Ordens de Serviço</h2>

      <form onSubmit={salvarOrdem} className="form-ordem">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          required
          disabled={!clienteId}
        >
          <option value="">Selecione o veículo</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.modelo} - {v.placa}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataEntrada}
          onChange={(e) => setDataEntrada(e.target.value)}
          required
        />

        <textarea
          placeholder="Problema informado pelo cliente"
          value={problemaCliente}
          onChange={(e) => setProblemaCliente(e.target.value)}
        />

        <textarea
          placeholder="Diagnóstico"
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />

        <textarea
          placeholder="Serviços realizados"
          value={servicosRealizados}
          onChange={(e) => setServicosRealizados(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor (R$)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          min="0"
          step="0.01"
          required
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="Aberta">Aberta</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluída">Concluída</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <button type="submit">{editandoId ? "Atualizar" : "Cadastrar"}</button>
        {editandoId && <button type="button" onClick={limparFormulario}>Cancelar</button>}
      </form>

      <h3>Lista de Ordens de Serviço</h3>
      <table className="tabela-ordens">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Data Entrada</th>
            <th>Valor (R$)</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ordens.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Nenhuma ordem cadastrada.
              </td>
            </tr>
          ) : (
            ordens.map((ordem) => (
              <tr key={ordem.id}>
                <td>{ordem.id}</td>
                <td>{ordem.clientes?.nome || "-"}</td>
                <td>{ordem.veiculos ? `${ordem.veiculos.modelo} (${ordem.veiculos.placa})` : "-"}</td>
                <td>{ordem.data_entrada}</td>
                <td>{ordem.valor.toFixed(2)}</td>
                <td>{ordem.status}</td>
                <td>
                  <button onClick={() => editarOrdem(ordem)}>Editar</button>{" "}
                  <button onClick={() => excluirOrdem(ordem.id)}>Excluir</button>{" "}
                  <button onClick={() => gerarPDF(ordem)}>Imprimir PDF</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
