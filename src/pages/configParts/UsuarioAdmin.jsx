import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

export default function UsuarioAdmin({ usuarios, novoUsuario, handleNovoUsuarioChange, cadastrarUsuario, excluirUsuario }) {
  return (
    <>
      <h3>Novo Usuário</h3>
      <Input name="nome" value={novoUsuario.nome} placeholder="Nome" onChange={handleNovoUsuarioChange} />
      <Input name="email" value={novoUsuario.email} placeholder="Email" onChange={handleNovoUsuarioChange} />
      <Input name="senha" type="password" value={novoUsuario.senha} placeholder="Senha" onChange={handleNovoUsuarioChange} />
      <Button onClick={cadastrarUsuario}>Cadastrar</Button>

      <Separator />
      <h3>Usuários Cadastrados</h3>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            {u.nome} ({u.email}){" "}
            <Button variant="outline" onClick={() => excluirUsuario(u.id)}>Excluir</Button>
          </li>
        ))}
      </ul>
    </>
  );
}