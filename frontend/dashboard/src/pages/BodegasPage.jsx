import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const apiBase = "http://localhost:5000/api";

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
};

const th = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  color: "#111827",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  color: "#111827",
};

function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #ddd",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#111827",
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: "14px", marginBottom: "8px", color: "#374151" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function BodegasPage() {
  const navigate = useNavigate();

  const [obras, setObras] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [openNuevaBodega, setOpenNuevaBodega] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formBodega, setFormBodega] = useState({
    nombre: "",
    direccion: "",
    encargado: "",
    fecha_inicio: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError("");
      const [obrasRes, herramientasRes] = await Promise.all([
        fetch(`${apiBase}/obras`),
        fetch(`${apiBase}/herramientas`),
      ]);

      const obrasText = await obrasRes.text();
      const herramientasText = await herramientasRes.text();

      const obrasData = obrasText ? JSON.parse(obrasText) : [];
      const herramientasData = herramientasText ? JSON.parse(herramientasText) : [];

      if (!obrasRes.ok || !herramientasRes.ok) {
        throw new Error("No se pudieron cargar las bodegas");
      }

      setObras(obrasData);
      setHerramientas(herramientasData);
    } catch (err) {
      setError(err.message || "Error al cargar las bodegas");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormBodega((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFormulario = () => {
    setFormBodega({
      nombre: "",
      direccion: "",
      encargado: "",
      fecha_inicio: "",
    });
  };

  const crearBodega = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formBodega.nombre || !formBodega.direccion || !formBodega.encargado || !formBodega.fecha_inicio) {
      setError("Nombre, dirección, encargado y fecha de inicio son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/obras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formBodega),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo crear la bodega");
      }

      setSuccess("Bodega creada correctamente.");
      setOpenNuevaBodega(false);
      resetFormulario();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al crear la bodega");
    }
  };

  const bodegas = useMemo(() => {
    const lista = [
      {
        id: "central",
        nombre: "Bodega Central",
        direccion: "-",
        encargado: "-",
        fecha_inicio: null,
        cantidad_herramientas: herramientas.filter((h) => h.bodega === "Bodega Central").length,
      },
      ...obras.map((obra) => ({
        id: obra.id,
        nombre: `Bodega ${obra.nombre}`,
        direccion: obra.direccion,
        encargado: obra.encargado,
        fecha_inicio: obra.fecha_inicio,
        cantidad_herramientas: herramientas.filter((h) => h.bodega === `Bodega ${obra.nombre}`).length,
      })),
    ];

    if (!busqueda.trim()) return lista;

    const q = busqueda.toLowerCase();
    return lista.filter((b) =>
      [b.nombre, b.direccion, b.encargado]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [obras, herramientas, busqueda]);

  return (
    <>
      <Modal
        open={openNuevaBodega}
        title="Nueva bodega"
        onClose={() => setOpenNuevaBodega(false)}
      >
        <form onSubmit={crearBodega}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Nombre de la bodega/obra *">
              <input
                name="nombre"
                value={formBodega.nombre}
                onChange={handleChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Encargado *">
              <input
                name="encargado"
                value={formBodega.encargado}
                onChange={handleChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Dirección *">
              <input
                name="direccion"
                value={formBodega.direccion}
                onChange={handleChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Fecha de inicio *">
              <input
                type="date"
                name="fecha_inicio"
                value={formBodega.fecha_inicio}
                onChange={handleChange}
                style={inputStyle}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setOpenNuevaBodega(false)}
              style={{
                border: "1px solid #ccc",
                background: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{
                border: "none",
                background: "#059669",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Guardar bodega
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Bodegas</h1>
          <p style={{ color: "#cbd5e1" }}>Gestión de bodegas y cantidad de herramientas por ubicación.</p>
        </div>

        <button
          onClick={() => setOpenNuevaBodega(true)}
          style={{
            border: "none",
            background: "#059669",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Nueva bodega
        </button>
      </div>

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

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Buscar por nombre, dirección o encargado"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, maxWidth: "420px" }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Bodega</th>
              <th style={th}>Dirección</th>
              <th style={th}>Encargado</th>
              <th style={th}>Fecha inicio</th>
              <th style={th}>Herramientas</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {bodegas.map((bodega) => (
              <tr key={bodega.id}>
                <td style={td}>{bodega.nombre}</td>
                <td style={td}>{bodega.direccion || "-"}</td>
                <td style={td}>{bodega.encargado || "-"}</td>
                <td style={td}>
                  {bodega.fecha_inicio
                    ? new Date(bodega.fecha_inicio).toLocaleDateString("es-CL")
                    : "-"}
                </td>
                <td style={td}>{bodega.cantidad_herramientas}</td>
                <td style={td}>
                  <button
                    onClick={() =>
                      navigate(`/inventario?bodega=${encodeURIComponent(bodega.nombre)}`)
                    }
                    style={{
                      border: "none",
                      background: "#2563eb",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Ver inventario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}