import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoEmpresa from "../assets/logo.png";

const linkStyle = (active) => ({
  display: "block",
  padding: "12px 16px",
  marginBottom: "8px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
  background: active ? "#2563eb" : "#1e293b",
  color: "#fff",
});

export default function Sidebar() {
  const location = useLocation();
  const { usuario, logout } = useAuth();

  return (
    <aside
      style={{
        width: "250px",
        background: "#e5e7eb",
        padding: "16px",
        boxSizing: "border-box",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "26px" }}>
        <div style={{ marginBottom: "12px", textAlign: "center" }}>
          <img
            src={logoEmpresa}
            alt="Logo empresa"
            style={{
              maxWidth: "180px",
              maxHeight: "70px",
              objectFit: "contain",
            }}
          />
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            color: "#0f172a",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          Sistema Inventario Herramientas
        </h2>

        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#64748b",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          Control de obras, herramientas, movimientos y reparaciones.
        </p>
      </div>

      <nav style={{ marginBottom: "20px" }}>
        <Link to="/" style={linkStyle(location.pathname === "/")}>Inicio</Link>
        <Link to="/inventario" style={linkStyle(location.pathname === "/inventario")}>Inventario</Link>
        <Link to="/herramientas" style={linkStyle(location.pathname === "/herramientas")}>Herramientas</Link>
        <Link to="/bodegas" style={linkStyle(location.pathname === "/bodegas")}>Bodegas</Link>
        <Link to="/contenedores" style={linkStyle(location.pathname === "/contenedores")}>Contenedores</Link>
        <Link to="/movimientos" style={linkStyle(location.pathname === "/movimientos")}>Movimientos</Link>
        <Link to="/reparaciones" style={linkStyle(location.pathname === "/reparaciones")}>Reparaciones</Link>

        {usuario?.rol === "admin" && (
          <>
            <Link to="/usuarios" style={linkStyle(location.pathname === "/usuarios")}>Usuarios</Link>
            <Link to="/configuracion" style={linkStyle(location.pathname === "/configuracion")}>Configuración</Link>
          </>
        )}
      </nav>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "#dbeafe",
          border: "1px solid #93c5fd",
          borderRadius: "12px",
          color: "#0f172a",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "10px" }}>
          Estado del sistema
        </div>

        <div
          style={{
            padding: "12px",
            background: "#f8fafc",
            border: "1px solid #dbeafe",
            borderRadius: "12px",
            color: "#0f172a",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "13px" }}>
            {usuario?.nombre || "Usuario"}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
            Rol: {usuario?.rol || "-"}
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              border: "none",
              background: "#111827",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div style={{ marginTop: "12px", fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>
          Backend y frontend separados, con módulos listos para seguir creciendo.
        </div>
      </div>
    </aside>
  );
}