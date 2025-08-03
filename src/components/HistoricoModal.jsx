import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function HistoricoModal({ cliente, onClose }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    async function buscarHistorico() {
      const { data } = await supabase
        .from("historico")
        .select("*")
        .eq("cliente_id", cliente.id);
      setHistorico(data);
    }
    buscarHistorico();
  }, [cliente]);

  return (
    <div className="modal">
      <h2>Histórico de {cliente.nome}</h2>
      <ul>
        {historico.map((item, i) => (
          <li key={i}>
            {item.data} - {item.descricao}
          </li>
        ))}
      </ul>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}
