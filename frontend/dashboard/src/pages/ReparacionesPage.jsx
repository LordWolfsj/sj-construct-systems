import { useEffect, useMemo, useState } from "react";

import { apiBase } from "../config";

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
          maxWidth: "760px",
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

export default function ReparacionesPage() {
  const [reparaciones, setReparaciones] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openNuevaReparacion, setOpenNuevaReparacion] = useState(false);
  const [openCerrarReparacion, setOpenCerrarReparacion] = useState(false);

const [formReparacion, setFormReparacion] = useState({
  herramienta_id: "",
  proveedor: "",
  descripcion_falla: "",
  fecha_envio: "",
  decision_final: "reparar",
  observaciones: "",
});

  const [formCerrarReparacion, setFormCerrarReparacion] = useState({
    reparacion_id: "",
    fecha_retorno: "",
    costo_reparacion: "",
    observaciones: "",
  });

  const [modoCierreReparacion, setModoCierreReparacion] = useState("reparada");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
  try {
    setError("");

    const [reparacionesRes, herramientasRes] = await Promise.all([
      fetch(`${apiBase}/reparaciones`),
      fetch(`${apiBase}/herramientas`),
    ]);

    const reparacionesType = reparacionesRes.headers.get("content-type") || "";
    const herramientasType = herramientasRes.headers.get("content-type") || "";

    if (!reparacionesRes.ok) {
      const txt = await reparacionesRes.text();
      throw new Error(`Error en /reparaciones: ${txt}`);
    }

    if (!herramientasRes.ok) {
      const txt = await herramientasRes.text();
      throw new Error(`Error en /herramientas: ${txt}`);
    }

    if (!reparacionesType.includes("application/json")) {
      const txt = await reparacionesRes.text();
      throw new Error(`La ruta /reparaciones no devolvió JSON: ${txt}`);
    }

    if (!herramientasType.includes("application/json")) {
      const txt = await herramientasRes.text();
      throw new Error(`La ruta /herramientas no devolvió JSON: ${txt}`);
    }

    const reparacionesData = await reparacionesRes.json();
    const herramientasData = await herramientasRes.json();

    setReparaciones(Array.isArray(reparacionesData) ? reparacionesData : []);
    setHerramientas(Array.isArray(herramientasData) ? herramientasData : []);
  } catch (err) {
    setError(err.message || "Error cargando reparaciones");
  }
};

  const herramientasParaReparacion = useMemo(() => {
    return herramientas.filter(
      (h) => h.estado !== "baja" && h.estado !== "en_reparacion"
    );
  }, [herramientas]);

  const reparacionesAbiertas = useMemo(() => {
    return reparaciones.filter((r) => r.estado === "en_reparacion");
  }, [reparaciones]);

  const reparacionesFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return reparaciones;

    return reparaciones.filter((r) =>
      [
        r.codigo_interno,
        r.herramienta,
        r.proveedor,
        r.descripcion_falla,
        r.estado,
        r.observaciones,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [reparaciones, busqueda]);

const handleReparacionChange = (e) => {
  const { name, value } = e.target;
  setFormReparacion((prev) => ({
    ...prev,
    [name]: name === "herramienta_id" ? Number(value) || "" : value,
  }));
};

  const handleCerrarChange = (e) => {
    const { name, value } = e.target;
    setFormCerrarReparacion((prev) => ({
      ...prev,
      [name]: name === "reparacion_id" ? Number(value) || "" : value,
    }));
  };

const resetFormReparacion = () => {
  setFormReparacion({
    herramienta_id: "",
    proveedor: "",
    descripcion_falla: "",
    fecha_envio: "",
    decision_final: "reparar",
    observaciones: "",
  });
};

  const resetFormCerrar = () => {
    setFormCerrarReparacion({
      reparacion_id: "",
      fecha_retorno: "",
      costo_reparacion: "",
      observaciones: "",
    });
    setModoCierreReparacion("reparada");
  };

  const crearReparacion = async (e) => {
try {
  const response = await fetch(`${apiBase}/reparaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formReparacion),
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.detalle || data?.error || "No se pudo registrar la reparación"
    );
  }

  setSuccess("Reparación registrada correctamente.");
  setOpenNuevaReparacion(false);
  resetFormReparacion();
  await cargarDatos();
} catch (err) {
  setError(err.message || "Error al registrar la reparación");
}
  };

const cerrarReparacion = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!formCerrarReparacion.reparacion_id) {
    setError("Debes seleccionar una reparación abierta.");
    return;
  }

  if (modoCierreReparacion === "reparada") {
    if (!formCerrarReparacion.fecha_retorno || formCerrarReparacion.costo_reparacion === "") {
      setError("Fecha de retorno y costo son obligatorios para cerrar como reparada.");
      return;
    }
  }

  try {
    const response = await fetch(
      `${apiBase}/reparaciones/${formCerrarReparacion.reparacion_id}/cerrar`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha_retorno:
            modoCierreReparacion === "reparada"
              ? formCerrarReparacion.fecha_retorno
              : null,
          costo_reparacion:
            modoCierreReparacion === "reparada"
              ? Number(formCerrarReparacion.costo_reparacion)
              : null,
          observaciones_cierre: formCerrarReparacion.observaciones || null,
          decision_cierre: modoCierreReparacion,
        }),
      }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const txt = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(
        typeof txt === "string"
          ? txt
          : txt?.detalle || txt?.error || "No se pudo cerrar la reparación"
      );
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : {};

    setSuccess(
      modoCierreReparacion === "reparada"
        ? "Reparación cerrada como reparada."
        : "Reparación cerrada como no reparable."
    );

    setOpenCerrarReparacion(false);
    resetFormCerrar();
    await cargarDatos();
  } catch (err) {
    setError(err.message || "Error al cerrar la reparación");
  }
};

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case "en_reparacion":
        return { background: "#fef3c7", color: "#92400e" };
      case "reparada":
        return { background: "#dcfce7", color: "#166534" };
      case "no_reparable":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#e5e7eb", color: "#374151" };
    }
  };

  return (
    <>
      <Modal
        open={openNuevaReparacion}
        title="Nueva reparación"
        onClose={() => setOpenNuevaReparacion(false)}
      >
        <form onSubmit={crearReparacion}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Herramienta *">
              <select
                name="herramienta_id"
                value={formReparacion.herramienta_id}
                onChange={handleReparacionChange}
                style={inputStyle}
              >
                <option value="">Selecciona una herramienta</option>
                {herramientasParaReparacion.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.codigo} - {h.nombre} - Serie: {h.numero_serie}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Proveedor *">
              <input
                type="text"
                name="proveedor"
                value={formReparacion.proveedor}
                onChange={handleReparacionChange}
                style={inputStyle}
                placeholder="Ingresa el nombre del proveedor"
              />
            </Campo>

            <Campo label="Fecha de envío *">
              <input
                type="date"
                name="fecha_envio"
                value={formReparacion.fecha_envio}
                onChange={handleReparacionChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Decisión final inicial">
              <select
                name="decision_final"
                value={formReparacion.decision_final}
                onChange={handleReparacionChange}
                style={inputStyle}
              >
                <option value="reparar">Reparar</option>
                <option value="dar_baja">Dar baja</option>
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Descripción de falla *">
              <textarea
                name="descripcion_falla"
                value={formReparacion.descripcion_falla}
                onChange={handleReparacionChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observaciones">
              <textarea
                name="observaciones"
                value={formReparacion.observaciones}
                onChange={handleReparacionChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setOpenNuevaReparacion(false)}
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
                background: "#ea580c",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Registrar reparación
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openCerrarReparacion}
        title="Cerrar reparación"
        onClose={() => setOpenCerrarReparacion(false)}
      >
        <form onSubmit={cerrarReparacion}>
          <div style={{ display: "grid", gap: "16px" }}>
            <Campo label="Reparación abierta *">
              <select
                name="reparacion_id"
                value={formCerrarReparacion.reparacion_id}
                onChange={handleCerrarChange}
                style={inputStyle}
              >
                <option value="">Selecciona reparación</option>
                {reparacionesAbiertas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.codigo_interno} - {r.herramienta}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Modo de cierre">
              <select
                value={modoCierreReparacion}
                onChange={(e) => setModoCierreReparacion(e.target.value)}
                style={inputStyle}
              >
                <option value="reparada">Cerrar como reparada</option>
                <option value="dar_baja">Cerrar como no reparable</option>
              </select>
            </Campo>

            {modoCierreReparacion === "reparada" && (
              <>
                <Campo label="Fecha de retorno *">
                  <input
                    type="date"
                    name="fecha_retorno"
                    value={formCerrarReparacion.fecha_retorno}
                    onChange={handleCerrarChange}
                    style={inputStyle}
                  />
                </Campo>

                <Campo label="Costo reparación *">
                  <input
                    type="number"
                    name="costo_reparacion"
                    value={formCerrarReparacion.costo_reparacion}
                    onChange={handleCerrarChange}
                    style={inputStyle}
                  />
                </Campo>
              </>
            )}

            <Campo label="Observaciones">
              <textarea
                name="observaciones"
                value={formCerrarReparacion.observaciones}
                onChange={handleCerrarChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setOpenCerrarReparacion(false)}
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
                background: modoCierreReparacion === "reparada" ? "#111827" : "#b91c1c",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              {modoCierreReparacion === "reparada"
                ? "Cerrar como reparada"
                : "Cerrar como no reparable"}
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Reparaciones</h1>
          <p style={{ color: "#cbd5e1" }}>Registro y cierre de reparaciones.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setOpenNuevaReparacion(true)}
            style={{
              border: "none",
              background: "#ea580c",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Nueva reparación
          </button>

          <button
            onClick={() => setOpenCerrarReparacion(true)}
            style={{
              border: "none",
              background: "#111827",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cerrar reparación
          </button>
        </div>
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
          placeholder="Buscar por código, herramienta, proveedor o falla"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, maxWidth: "420px" }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>ID</th>
              <th style={th}>Código</th>
              <th style={th}>Herramienta</th>
              <th style={th}>Proveedor</th>
              <th style={th}>Falla</th>
              <th style={th}>Fecha envío</th>
              <th style={th}>Fecha retorno</th>
              <th style={th}>Costo</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reparacionesFiltradas.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.id}</td>
                <td style={td}>{r.codigo_interno}</td>
                <td style={td}>{r.herramienta}</td>
                <td style={td}>{r.proveedor || "-"}</td>
                <td style={td}>{r.descripcion_falla}</td>
                <td style={td}>
                  {r.fecha_envio ? new Date(r.fecha_envio).toLocaleDateString("es-CL") : "-"}
                </td>
                <td style={td}>
                  {r.fecha_retorno ? new Date(r.fecha_retorno).toLocaleDateString("es-CL") : "-"}
                </td>
                <td style={td}>
                  {r.costo_reparacion ? `$${Number(r.costo_reparacion).toLocaleString("es-CL")}` : "-"}
                </td>
                <td style={td}>
                  <span
                    style={{
                      ...getEstadoStyle(r.estado),
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {r.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}