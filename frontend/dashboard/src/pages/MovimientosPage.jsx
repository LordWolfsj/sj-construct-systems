import { useEffect, useMemo, useState } from "react";

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

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [movimientosContenedores, setMovimientosContenedores] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openNuevoMovimiento, setOpenNuevoMovimiento] = useState(false);
  const [openNuevoMovimientoContenedor, setOpenNuevoMovimientoContenedor] = useState(false);

  const [formMovimiento, setFormMovimiento] = useState({
    herramienta_id: "",
    bodega_destino: "",
    usuario_id: 1,
    observacion: "",
  });

  const [formMovimientoContenedor, setFormMovimientoContenedor] = useState({
    contenedor_id: "",
    bodega_destino: "",
    usuario_id: 1,
    observacion: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError("");

      const movimientosRes = await fetch(`${apiBase}/movimientos`).catch(() => null);
      const movimientosContenedoresRes = await fetch(`${apiBase}/movimientos-contenedores`).catch(() => null);
      const herramientasRes = await fetch(`${apiBase}/herramientas`).catch(() => null);
      const contenedoresRes = await fetch(`${apiBase}/contenedores`).catch(() => null);
      const bodegasRes = await fetch(`${apiBase}/bodegas`).catch(() => null);

      const movimientosData = movimientosRes ? await movimientosRes.json().catch(() => []) : [];
      const movimientosContenedoresData = movimientosContenedoresRes ? await movimientosContenedoresRes.json().catch(() => []) : [];
      const herramientasData = herramientasRes ? await herramientasRes.json().catch(() => []) : [];
      const contenedoresData = contenedoresRes ? await contenedoresRes.json().catch(() => []) : [];
      const bodegasData = bodegasRes ? await bodegasRes.json().catch(() => []) : [];

      setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
      setMovimientosContenedores(Array.isArray(movimientosContenedoresData) ? movimientosContenedoresData : []);
      setHerramientas(Array.isArray(herramientasData) ? herramientasData : []);
      setContenedores(Array.isArray(contenedoresData) ? contenedoresData : []);
      setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
    } catch (err) {
      setError("No se pudieron cargar los movimientos");
    }
  };

  const herramientasMovibles = useMemo(() => {
    return herramientas.filter(
      (h) => h.estado !== "baja" && h.estado !== "en_reparacion"
    );
  }, [herramientas]);

  const contenedoresMovibles = useMemo(() => {
    return contenedores;
  }, [contenedores]);

  const herramientaSeleccionada = useMemo(() => {
    return herramientas.find((h) => Number(h.id) === Number(formMovimiento.herramienta_id));
  }, [herramientas, formMovimiento.herramienta_id]);

  const contenedorSeleccionado = useMemo(() => {
    return contenedores.find((c) => Number(c.id) === Number(formMovimientoContenedor.contenedor_id));
  }, [contenedores, formMovimientoContenedor.contenedor_id]);

  const bodegasDestinoHerramienta = useMemo(() => {
    if (!herramientaSeleccionada) return bodegas;
    return bodegas.filter(
      (b) => Number(b.id) !== Number(herramientaSeleccionada.bodega_id)
    );
  }, [bodegas, herramientaSeleccionada]);

  const bodegasDestinoContenedor = useMemo(() => {
    if (!contenedorSeleccionado) return bodegas;
    return bodegas.filter(
      (b) => Number(b.id) !== Number(contenedorSeleccionado.bodega_id)
    );
  }, [bodegas, contenedorSeleccionado]);

  const movimientosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return movimientos;

    return movimientos.filter((mov) =>
      [
        mov.codigo_interno,
        mov.herramienta,
        mov.bodega_origen_nombre,
        mov.bodega_destino_nombre,
        mov.observacion,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [movimientos, busqueda]);

  const movimientosContenedoresFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return movimientosContenedores;

    return movimientosContenedores.filter((mov) =>
      [
        mov.numero_manual,
        mov.codigo_interno,
        mov.tipo,
        mov.bodega_origen_nombre,
        mov.bodega_destino_nombre,
        mov.observacion,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [movimientosContenedores, busqueda]);

  const handleMovimientoChange = (e) => {
    const { name, value } = e.target;
    setFormMovimiento((prev) => ({
      ...prev,
      [name]:
        name === "herramienta_id" || name === "bodega_destino" || name === "usuario_id"
          ? Number(value) || ""
          : value,
    }));
  };

  const handleMovimientoContenedorChange = (e) => {
    const { name, value } = e.target;
    setFormMovimientoContenedor((prev) => ({
      ...prev,
      [name]:
        name === "contenedor_id" || name === "bodega_destino" || name === "usuario_id"
          ? Number(value) || ""
          : value,
    }));
  };

  const resetFormularioHerramienta = () => {
    setFormMovimiento({
      herramienta_id: "",
      bodega_destino: "",
      usuario_id: 1,
      observacion: "",
    });
  };

  const resetFormularioContenedor = () => {
    setFormMovimientoContenedor({
      contenedor_id: "",
      bodega_destino: "",
      usuario_id: 1,
      observacion: "",
    });
  };

  const crearMovimiento = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!herramientaSeleccionada) {
      setError("Debes seleccionar una herramienta.");
      return;
    }

    if (!formMovimiento.bodega_destino) {
      setError("Debes seleccionar una bodega destino.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/movimientos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          herramienta_id: Number(formMovimiento.herramienta_id),
          bodega_origen: Number(herramientaSeleccionada.bodega_id),
          bodega_destino: Number(formMovimiento.bodega_destino),
          usuario_id: 1,
          observacion: formMovimiento.observacion || null,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.detalle || data?.error || "No se pudo registrar el movimiento"
        );
      }

      setSuccess("Movimiento de herramienta registrado correctamente.");
      setOpenNuevoMovimiento(false);
      resetFormularioHerramienta();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al registrar el movimiento");
    }
  };

  const crearMovimientoContenedor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!contenedorSeleccionado) {
      setError("Debes seleccionar un contenedor.");
      return;
    }

    if (!formMovimientoContenedor.bodega_destino) {
      setError("Debes seleccionar una bodega destino.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/movimientos-contenedores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contenedor_id: Number(formMovimientoContenedor.contenedor_id),
          bodega_origen: Number(contenedorSeleccionado.bodega_id),
          bodega_destino: Number(formMovimientoContenedor.bodega_destino),
          usuario_id: 1,
          observacion: formMovimientoContenedor.observacion || null,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.detalle || data?.error || "No se pudo registrar el movimiento del contenedor"
        );
      }

      setSuccess("Movimiento de contenedor registrado correctamente.");
      setOpenNuevoMovimientoContenedor(false);
      resetFormularioContenedor();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al registrar el movimiento del contenedor");
    }
  };

  return (
    <>
      <Modal
        open={openNuevoMovimiento}
        title="Nuevo movimiento de herramienta"
        onClose={() => setOpenNuevoMovimiento(false)}
      >
        <form onSubmit={crearMovimiento}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Herramienta *">
              <select
                name="herramienta_id"
                value={formMovimiento.herramienta_id}
                onChange={handleMovimientoChange}
                style={inputStyle}
              >
                <option value="">Selecciona una herramienta</option>
                {herramientasMovibles.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.codigo_interno} - {h.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Bodega origen">
              <input
                value={herramientaSeleccionada?.bodega || ""}
                disabled
                style={{ ...inputStyle, background: "#f3f4f6" }}
                placeholder="Se completa automáticamente"
              />
            </Campo>

            <Campo label="Bodega destino *">
              <select
                name="bodega_destino"
                value={formMovimiento.bodega_destino}
                onChange={handleMovimientoChange}
                style={inputStyle}
              >
                <option value="">Selecciona una bodega</option>
                {bodegasDestinoHerramienta.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observación">
              <textarea
                name="observacion"
                value={formMovimiento.observacion}
                onChange={handleMovimientoChange}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setOpenNuevoMovimiento(false)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>
              Cancelar
            </button>

            <button type="submit" style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>
              Registrar movimiento
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openNuevoMovimientoContenedor}
        title="Nuevo movimiento de contenedor"
        onClose={() => setOpenNuevoMovimientoContenedor(false)}
      >
        <form onSubmit={crearMovimientoContenedor}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Contenedor *">
              <select
                name="contenedor_id"
                value={formMovimientoContenedor.contenedor_id}
                onChange={handleMovimientoContenedorChange}
                style={inputStyle}
              >
                <option value="">Selecciona un contenedor</option>
                {contenedoresMovibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo_interno} - {c.numero_manual} - {c.tipo}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Bodega origen">
              <input
                value={contenedorSeleccionado?.bodega_nombre || ""}
                disabled
                style={{ ...inputStyle, background: "#f3f4f6" }}
                placeholder="Se completa automáticamente"
              />
            </Campo>

            <Campo label="Bodega destino *">
              <select
                name="bodega_destino"
                value={formMovimientoContenedor.bodega_destino}
                onChange={handleMovimientoContenedorChange}
                style={inputStyle}
              >
                <option value="">Selecciona una bodega</option>
                {bodegasDestinoContenedor.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observación">
              <textarea
                name="observacion"
                value={formMovimientoContenedor.observacion}
                onChange={handleMovimientoContenedorChange}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setOpenNuevoMovimientoContenedor(false)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>
              Cancelar
            </button>

            <button type="submit" style={{ border: "none", background: "#16a34a", color: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>
              Registrar movimiento contenedor
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Movimientos</h1>
          <p style={{ color: "#cbd5e1" }}>Historial de traslados entre bodegas.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setOpenNuevoMovimiento(true)}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Movimiento herramienta
          </button>

          <button
            onClick={() => setOpenNuevoMovimientoContenedor(true)}
            style={{
              border: "none",
              background: "#16a34a",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Movimiento contenedor
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Buscar por código, herramienta, contenedor, origen, destino u observación"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, maxWidth: "420px" }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "16px", fontWeight: "bold", color: "#111827", borderBottom: "1px solid #eee" }}>
          Movimientos de herramientas
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Fecha</th>
              <th style={th}>Código</th>
              <th style={th}>Herramienta</th>
              <th style={th}>Origen</th>
              <th style={th}>Destino</th>
              <th style={th}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov) => (
              <tr key={mov.id}>
                <td style={td}>{mov.fecha ? new Date(mov.fecha).toLocaleString("es-CL") : "-"}</td>
                <td style={td}>{mov.codigo_interno || "-"}</td>
                <td style={td}>{mov.herramienta || "-"}</td>
                <td style={td}>{mov.bodega_origen_nombre || "-"}</td>
                <td style={td}>{mov.bodega_destino_nombre || "-"}</td>
                <td style={td}>{mov.observacion || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "16px", fontWeight: "bold", color: "#111827", borderBottom: "1px solid #eee" }}>
          Movimientos de contenedores
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Fecha</th>
              <th style={th}>Código</th>
              <th style={th}>Número</th>
              <th style={th}>Tipo</th>
              <th style={th}>Origen</th>
              <th style={th}>Destino</th>
              <th style={th}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {movimientosContenedoresFiltrados.map((mov) => (
              <tr key={mov.id}>
                <td style={td}>{mov.fecha ? new Date(mov.fecha).toLocaleString("es-CL") : "-"}</td>
                <td style={td}>{mov.codigo_interno || "-"}</td>
                <td style={td}>{mov.numero_manual || "-"}</td>
                <td style={td}>{mov.tipo || "-"}</td>
                <td style={td}>{mov.bodega_origen_nombre || "-"}</td>
                <td style={td}>{mov.bodega_destino_nombre || "-"}</td>
                <td style={td}>{mov.observacion || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}