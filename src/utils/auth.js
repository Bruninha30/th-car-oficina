// src/utils/auth.js
export function isAdmin(user) {
  return user?.tipo === "admin";
}

export function isFuncionario(user) {
  return user?.tipo === "funcionario";
}
