import { useState } from "react";

const apiBase = "http://localhost:5000/api";

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
};

export default function ConfiguracionPage() {
  const [claveAdmin, setClaveAdmin] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("operador");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetearSistema = async () => {
    setError("");
    setSuccess("");

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar todos los datos del sistema? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`${apiBase}/configuracion/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clave_admin: claveAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo resetear el sistema");
      }

      setSuccess("Sistema reiniciado correctamente.");
      setClaveAdmin("");
    } catch (err) {
      setError(err.message || "Error al resetear el sistema");
    }
  };

  return (
    <>
      <h1>Configuración</h1>
      <p style={{ color: "#cbd5e1" }}>
        Administración general del sistema.
      </p>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            color: "#111827",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#991b1b" }}>Reinicio total del sistema</h3>
          <p>
            Esta acción eliminará todos los registros operativos y dejará el sistema como nuevo.
          </p>

          <div style={{ maxWidth: "360px", marginBottom: "12px" }}>
            <input
              type="password"
              placeholder="Clave de administrador"
              value={claveAdmin}
              onChange={(e) => setClaveAdmin(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={resetearSistema}
            style={{
              border: "none",
              background: "#b91c1c",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Eliminar datos y reiniciar sistema
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            color: "#111827",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Gestión de usuarios</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              maxWidth: "700px",
            }}
          >
            <input
              placeholder="Nombre completo"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={inputStyle}
            >
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            style={{
              marginTop: "14px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Crear usuario
          </button>
        </div>
      </div>
    </>
  );
}