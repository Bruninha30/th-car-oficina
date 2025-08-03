import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute({ children, tipoPermitido }) {
  const [autorizado, setAutorizado] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const userId = data?.user?.id;
      if (userId) {
        supabase
          .from("usuarios")
          .select("tipo")
          .eq("id", userId)
          .single()
          .then(({ data }) => {
            if (data && data.tipo === tipoPermitido) {
              setAutorizado(true);
            } else {
              setAutorizado(false);
            }
          });
      } else {
        setAutorizado(false);
      }
    });
  }, [tipoPermitido]);

  if (autorizado === null) return <p>Verificando permissão...</p>;
  if (!autorizado) return <Navigate to="/login" />;

  return children;
}