import { useEffect, useState } from "react";

import { apiBase } from "../config";

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #ddd",
        textAlign: "center",
        color: "#111827",
      }}
    >
      <div style={{ color: "#666", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState({});
  const [reparaciones, setReparaciones] = useState([]);
  const [bodegasResumen, setBodegasResumen] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setError("");

      const [resumenRes, reparacionesRes, bodegasRes] = await Promise.all([
        fetch(`${apiBase}/dashboard/resumen`),
        fetch(`${apiBase}/reparaciones`),
        fetch(`${apiBase}/dashboard/bodegas`),
      ]);

      const resumenData = await resumenRes.json();
      const reparacionesData = await reparacionesRes.json();
      const bodegasData = await bodegasRes.json();

      setResumen(resumenData || {});
      setReparaciones(
        Array.isArray(reparacionesData)
          ? reparacionesData.filter((r) => r.estado === "en_reparacion")
          : []
      );
      setBodegasResumen(Array.isArray(bodegasData) ? bodegasData : []);
    } catch (err) {
      setError("No se pudieron cargar los datos del dashboard");
    }
  };

  return (
    <>
      <h1>Dashboard Ejecutivo</h1>
      <p style={{ color: "#cbd5e1" }}>Resumen del inventario y alertas importantes.</p>

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatCard title="Herramientas totales" value={resumen.total_herramientas ?? 0} />
        <StatCard title="Disponibles" value={resumen.disponibles ?? 0} />
        <StatCard title="En obra" value={resumen.en_obra ?? 0} />
        <StatCard title="En reparación" value={resumen.en_reparacion ?? 0} />
      </div>

      {Number(resumen.en_reparacion || 0) > 0 ? (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid orange",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            color: "#9a3412",
          }}
        >
          <b>Atención: hay herramientas en reparación</b>
          <div>Actualmente tienes {resumen.en_reparacion} herramienta(s) en reparación.</div>
        </div>
      ) : (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #86efac",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            color: "#166534",
          }}
        >
          No hay herramientas en reparación en este momento.
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          color: "#111827",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Conteo por bodega</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Bodega</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Herramientas</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Contenedores</th>
            </tr>
          </thead>
          <tbody>
            {bodegasResumen.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{b.nombre}</td>
                <td style={{ padding: "10px" }}>{b.tipo || "-"}</td>
                <td style={{ padding: "10px" }}>{Number(b.total_herramientas || 0)}</td>
                <td style={{ padding: "10px" }}>{Number(b.total_contenedores || 0)}</td>
              </tr>
            ))}

            {bodegasResumen.length === 0 && (
              <tr>
                <td style={{ padding: "10px" }} colSpan={4}>
                  No hay bodegas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          color: "#111827",
        }}
      >
        <h3>Estado de reparaciones</h3>

        {reparaciones.length === 0 && <div>No hay reparaciones abiertas</div>}

        {reparaciones.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "12px",
              marginTop: "10px",
            }}
          >
            <b>
              {r.codigo_interno} - {r.herramienta}
            </b>
            <div>Falla: {r.descripcion_falla}</div>
            <div>Proveedor: {r.proveedor || "-"}</div>
          </div>
        ))}
      </div>
    </>
  );
}