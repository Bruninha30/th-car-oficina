import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./Dashboard.css";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Dashboard() {
  const [dataHoraAtual, setDataHoraAtual] = useState(new Date());
  const [totais, setTotais] = useState({
    clientes: 0,
    veiculos: 0,
    abertas: 0,
    andamento: 0,
    finalizadas: 0
  });
  const [graficoBarra, setGraficoBarra] = useState([]);
  const [graficoLinha, setGraficoLinha] = useState([]);

  useEffect(() => {
    fetchDados();

    const timer = setInterval(() => {
      setDataHoraAtual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDados = async () => {
    try {
      // Conta clientes
      const { count: clientes, error: errClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });
      if (errClientes) throw errClientes;

      // Conta veículos
      const { count: veiculos, error: errVeiculos } = await supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true });
      if (errVeiculos) throw errVeiculos;

      // Busca ordens de serviço
      const { data: ordens, error: errOrdens } = await supabase
        .from("ordens_servico")
        .select("*");
      if (errOrdens) throw errOrdens;
      if (!ordens) throw new Error("Dados de ordens são nulos");

      // Inicializa contadores
      const statusCount = { abertas: 0, andamento: 0, finalizadas: 0 };
      const barraPorMes = {};
      const linhaPorMes = {};

      ordens.forEach((os) => {
        const data = new Date(os.criado_em || os.data_entrada || Date.now());
        const chave = `${data.getMonth()}-${data.getFullYear()}`;
        const label = `${meses[data.getMonth()]}/${data.getFullYear()}`;
        const status = os.status;

        // Gráfico de barras empilhadas
        if (!barraPorMes[chave]) {
          barraPorMes[chave] = { mes: label, Aberta: 0, "Em Andamento": 0, Finalizada: 0 };
        }

        if (status === "Aberta") {
          statusCount.abertas++;
          barraPorMes[chave].Aberta++;
        } else if (status === "Em Andamento") {
          statusCount.andamento++;
          barraPorMes[chave]["Em Andamento"]++;
        } else if (status === "Finalizada") {
          statusCount.finalizadas++;
          barraPorMes[chave].Finalizada++;
        }

        // Gráfico de linha (total OS por mês)
        if (!linhaPorMes[label]) linhaPorMes[label] = { mes: label, total: 0 };
        linhaPorMes[label].total++;
      });

      // Ordena os dados dos gráficos por data
      const graficoBarraOrdenado = Object.entries(barraPorMes)
        .sort(([a], [b]) => {
          const [mA, yA] = a.split("-");
          const [mB, yB] = b.split("-");
          return new Date(`${yA}-${Number(mA) + 1}-01`) - new Date(`${yB}-${Number(mB) + 1}-01`);
        })
        .map(([, value]) => value);

      const graficoLinhaOrdenado = Object.values(linhaPorMes)
        .sort((a, b) => {
          const [mesA, anoA] = a.mes.split("/");
          const [mesB, anoB] = b.mes.split("/");
          return new Date(`${anoA}-${meses.indexOf(mesA) + 1}-01`) - new Date(`${anoB}-${meses.indexOf(mesB) + 1}-01`);
        });

      // Atualiza estados
      setTotais({
        clientes: clientes || 0,
        veiculos: veiculos || 0,
        abertas: statusCount.abertas,
        andamento: statusCount.andamento,
        finalizadas: statusCount.finalizadas,
      });

      setGraficoBarra(graficoBarraOrdenado);
      setGraficoLinha(graficoLinhaOrdenado);

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error.message || error);
      // Opcional: mostrar erro na interface, se quiser
    }
  };

  const graficoPizza = [
    { name: "Aberta", value: totais.abertas },
    { name: "Em Andamento", value: totais.andamento },
    { name: "Finalizada", value: totais.finalizadas }
  ];

  const coresPizza = ["#f39c12", "#2980b9", "#27ae60"];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard da Oficina</h1>
        <p>{dataHoraAtual.toLocaleDateString()} - {dataHoraAtual.toLocaleTimeString()}</p>
      </header>

      <section className="status-cards">
        <div className="card aberta"><h3>OS Abertas</h3><p>{totais.abertas}</p></div>
        <div className="card andamento"><h3>Em Andamento</h3><p>{totais.andamento}</p></div>
        <div className="card finalizada"><h3>Finalizadas</h3><p>{totais.finalizadas}</p></div>
        <div className="card cliente"><h3>Clientes</h3><p>{totais.clientes}</p></div>
        <div className="card veiculo"><h3>Veículos</h3><p>{totais.veiculos}</p></div>
      </section>

      <section className="grafico-section">
        <div className="grafico-box">
          <h2>📊 OS por Mês ({graficoBarra.length} meses)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={graficoBarra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value, name) => [`${value} OS`, name]} />
              <Legend />
              <Bar dataKey="Aberta" stackId="a" fill="#FF8C00" />
              <Bar dataKey="Em Andamento" stackId="a" fill="#1E90FF" />
              <Bar dataKey="Finalizada" stackId="a" fill="#32CD32" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grafico-box">
          <h2>📈 Crescimento de OS</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={graficoLinha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#e74c3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grafico-box">
          <h2>💹 Proporção de Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={graficoPizza}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={80}
                label
              >
                {graficoPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
