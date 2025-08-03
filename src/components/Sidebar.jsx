import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // ⬅ adiciona useNavigate
import { supabase } from "../supabaseClient"; // ⬅ importa Supabase
import "./Sidebar.css";
import logo from "/logo-thcar.png";
import {
  FaTools,
  FaUser,
  FaCar,
  FaClipboardList,
  FaSignOutAlt,
  FaChartBar,
  FaCogs
} from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate(); // ⬅ hook para redirecionamento

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // ⬅ encerra sessão
      navigate("/login");            // ⬅ redireciona para login
    } catch (error) {
      console.error("Erro ao sair:", error.message);
      alert("Erro ao encerrar sessão. Tente novamente.");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo da Oficina" className="logo-img" />
      </div>

      <nav className="sidebar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaClipboardList /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaTools /> <span>Clientes</span>
        </NavLink>
        <NavLink to="/veiculos" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaUser /> <span>Veiculos</span>
        </NavLink>
        <NavLink to="/ordem-servico" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaCar /> <span>Ordem de serviços</span>
        </NavLink>
        <NavLink to="/relatorio" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaChartBar /> <span>Relatórios</span>
        </NavLink>
        <NavLink to="/usuario" className={({ isActive }) => isActive ? "link active" : "link"}>
          <FaCogs /> <span>Usuario</span>
        </NavLink>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Sair</span>
      </button>
    </div>
  );
}