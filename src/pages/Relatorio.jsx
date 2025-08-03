import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./Relatorio.css";
import logoImg from "../assets/logo.png";

const dadosEmpresa = {
  nome: "TH CAR Mecânica Automotiva",
  cnpj: "53.093.383/0001-56",
  telefone: "(69) 99276-6114",
  email: "thiagocristiane5t@gmail.com",
  endereco: "Rua E05, Bairro Flor de Liz, Vilhena / RO",
};

export default function Relatorio() {
  const [totalOS, setTotalOS] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [receitaTotal, setReceitaTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    Aberta: 0,
    "Em Andamento": 0,
    Finalizada: 0,
    Cancelada: 0,
  });

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const { data: osData, error: osError } = await supabase
      .from("ordens_servico")
      .select("status, valor");

    if (osError) {
      console.error("Erro ao buscar ordens:", osError);
      return;
    }

    setTotalOS(osData.length);

    const counts = { Aberta: 0, "Em Andamento": 0, Finalizada: 0, Cancelada: 0 };
    let receita = 0;

    osData.forEach((os) => {
      counts[os.status] = (counts[os.status] || 0) + 1;
      if (os.status === "Finalizada") {
        receita += Number(os.valor);
      }
    });

    setStatusCounts(counts);
    setReceitaTotal(receita);

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("id");

    if (clientesError) {
      console.error("Erro ao buscar clientes:", clientesError);
      return;
    }

    setTotalClientes(clientesData.length);
  }

  function gerarPDF() {
    const doc = new jsPDF("p", "mm", "a4");

    // Logo + Dados empresa (como na Ordem de Serviço)
    if (logoImg) {
      doc.addImage(logoImg, "PNG", 10, 10, 40, 30);
    }

    doc.setFontSize(14);
    doc.text(dadosEmpresa.nome, 55, 15);
    doc.setFontSize(10);
    doc.text(`CNPJ: ${dadosEmpresa.cnpj}`, 55, 21);
    doc.text(`Telefone: ${dadosEmpresa.telefone}`, 55, 27);
    doc.text(`Email: ${dadosEmpresa.email}`, 55, 33);
    doc.text(`Endereço: ${dadosEmpresa.endereco}`, 55, 39);

    doc.setFontSize(16);
    doc.text("Relatório Geral", 105, 50, null, null, "center");

    // Informações principais
    doc.setFontSize(12);
    doc.text(`Total de Ordens de Serviço: ${totalOS}`, 15, 60);
    doc.text(`Total de Clientes: ${totalClientes}`, 15, 68);
    doc.text(`Receita Total (R$): ${receitaTotal.toFixed(2)}`, 15, 76);

    // Tabela por status
    const tabelaData = [
      ["Status", "Quantidade"],
      ["Aberta", statusCounts.Aberta],
      ["Em Andamento", statusCounts["Em Andamento"]],
      ["Finalizada", statusCounts.Finalizada],
      ["Cancelada", statusCounts.Cancelada],
    ];

    autoTable(doc, {
      startY: 85,
      head: [tabelaData[0]],
      body: tabelaData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [30, 144, 255] },
      styles: { fontSize: 11 },
    });

    doc.save("relatorio-thcar.pdf");
  }

  return (
    <div className="relatorios-container">
      <h2>Relatório Geral</h2>

      <div className="info-header">
        <img src={logoImg} alt="Logo TH CAR" width="100" />
        <div className="dados-empresa">
          <h3>{dadosEmpresa.nome}</h3>
          <p><strong>CNPJ:</strong> {dadosEmpresa.cnpj}</p>
          <p><strong>Telefone:</strong> {dadosEmpresa.telefone}</p>
          <p><strong>Email:</strong> {dadosEmpresa.email}</p>
          <p><strong>Endereço:</strong> {dadosEmpresa.endereco}</p>
        </div>
      </div>

      <div className="cards-relatorios">
        <div className="card">
          <h3>Total de Ordens de Serviço</h3>
          <p>{totalOS}</p>
        </div>

        <div className="card">
          <h3>Total de Clientes</h3>
          <p>{totalClientes}</p>
        </div>

        <div className="card">
          <h3>Receita Total (R$)</h3>
          <p>{receitaTotal.toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Status das Ordens</h3>
          <ul>
            <li><strong>Aberta:</strong> {statusCounts.Aberta}</li>
            <li><strong>Em Andamento:</strong> {statusCounts["Em Andamento"]}</li>
            <li><strong>Finalizada:</strong> {statusCounts.Finalizada}</li>
            <li><strong>Cancelada:</strong> {statusCounts.Cancelada}</li>
          </ul>
        </div>
      </div>

      <button onClick={gerarPDF} className="btn-pdf">
        Gerar PDF
      </button>
    </div>
  );
}
