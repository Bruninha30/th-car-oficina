export function useTipoUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  return usuario?.cargo || "admin";
}