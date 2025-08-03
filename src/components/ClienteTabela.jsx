import { supabase } from "../supabaseClient"; // ajuste o caminho conforme sua estrutura

export default function ClienteTabela({ clientes, onAbrirHistorico, atualizarLista }) {

  async function excluirCliente(id) {
    await supabase.from("clientes").delete().eq("id", id);
    atualizarLista();
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th><th>Telefone</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map(cliente => (
          <tr key={cliente.id}>
            <td>{cliente.nome}</td>
            <td>{cliente.telefone}</td>
            <td>
              <button onClick={() => onAbrirHistorico(cliente)}>Ver Histórico</button>
              <button onClick={() => excluirCliente(cliente.id)}>Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
