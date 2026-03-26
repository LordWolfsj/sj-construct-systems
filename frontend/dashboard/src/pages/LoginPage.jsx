import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { apiBase } from "../config";

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${apiBase}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo iniciar sesión");
      }

      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: "20px",
      }}
    >
      <form
        onSubmit={iniciarSesion}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#111827" }}>Ingreso al sistema</h1>
        <p style={{ color: "#6b7280" }}>Usa tu usuario y contraseña.</p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}