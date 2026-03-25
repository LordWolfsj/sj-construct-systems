import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const apiBase = "http://localhost:5000/api";

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
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

function Modal({ open, title, onClose, children, maxWidth = "760px" }) {
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
          maxWidth,
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #ddd",
          maxHeight: "90vh",
          overflowY: "auto",
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
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 5,
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

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [reparaciones, setReparaciones] = useState([]);
  const [bodegas, setBodegas] = useState([]);
    useEffect(() => {
  console.log("BODEGAS CARGADAS:", bodegas);
}, [bodegas]);


  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [bodegaFiltro, setBodegaFiltro] = useState("todas");

  const [openNuevaHerramienta, setOpenNuevaHerramienta] = useState(false);
  const [openMovimiento, setOpenMovimiento] = useState(false);
  const [openReparacion, setOpenReparacion] = useState(false);
  const [openHojaVida, setOpenHojaVida] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [herramientaHojaVida, setHerramientaHojaVida] = useState(null);

  const [formHerramienta, setFormHerramienta] = useState({
    nombre: "",
    categoria_id: 1,
    marca: "",
    modelo: "",
    numero_serie: "",
    bodega_id: "",
    fecha_compra: "",
    costo_compra: "",
    observaciones: "",
  });

  const [formMovimiento, setFormMovimiento] = useState({
    herramienta_id: "",
    bodega_destino: "",
    usuario_id: 1,
    observacion: "",
  });

  const [formReparacion, setFormReparacion] = useState({
    herramienta_id: "",
    proveedor_id: 1,
    descripcion_falla: "",
    fecha_envio: "",
    decision_final: "reparar",
    observaciones: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
  console.log("BODEGAS:", bodegas);
}, [bodegas]);

  const cargarDatos = async () => {
  try {
    setError("");

    const herramientasRes = await fetch(`${apiBase}/herramientas`).catch(() => null);
    const movimientosRes = await fetch(`${apiBase}/movimientos`).catch(() => null);
    const reparacionesRes = await fetch(`${apiBase}/reparaciones`).catch(() => null);
    const bodegasRes = await fetch(`${apiBase}/bodegas`).catch(() => null);

    const herramientasData = herramientasRes ? await herramientasRes.json().catch(() => []) : [];
    const movimientosData = movimientosRes ? await movimientosRes.json().catch(() => []) : [];
    const reparacionesData = reparacionesRes ? await reparacionesRes.json().catch(() => []) : [];
    const bodegasData = bodegasRes ? await bodegasRes.json().catch(() => []) : [];

    setHerramientas(Array.isArray(herramientasData) ? herramientasData : []);
    setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
    setReparaciones(Array.isArray(reparacionesData) ? reparacionesData : []);
    setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
  } catch (err) {
    console.error("ERROR GENERAL:", err);
    setError("Error cargando datos");
  }
};

 const bodegaOptions = useMemo(() => {
  if (!Array.isArray(bodegas)) return [];
  return bodegas.map((b) => ({
    id: Number(b.id),
    nombre: b.nombre,
  }));
}, [bodegas]);

  const bodegasDisponibles = useMemo(() => {
    const unicas = [...new Set(herramientas.map((h) => h.bodega).filter(Boolean))];
    const ordenadas = unicas.sort((a, b) => a.localeCompare(b));
    const sinCentral = ordenadas.filter((b) => b !== "Bodega Central");
    return ["Bodega Central", ...sinCentral];
  }, [herramientas]);

  const herramientasFiltradas = useMemo(() => {
    return herramientas
      .filter((h) => {
        if (estadoFiltro !== "todos" && h.estado !== estadoFiltro) return false;
        if (bodegaFiltro !== "todas" && h.bodega !== bodegaFiltro) return false;

        if (busqueda) {
          const t = busqueda.toLowerCase();
          if (
            !h.codigo_interno?.toLowerCase().includes(t) &&
            !h.nombre?.toLowerCase().includes(t) &&
            !h.marca?.toLowerCase().includes(t) &&
            !h.modelo?.toLowerCase().includes(t) &&
            !h.numero_serie?.toLowerCase().includes(t)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.codigo_interno.localeCompare(b.codigo_interno));
  }, [herramientas, busqueda, estadoFiltro, bodegaFiltro]);

  const herramientaSeleccionadaMovimiento = useMemo(() => {
    return herramientas.find((h) => h.id === Number(formMovimiento.herramienta_id));
  }, [herramientas, formMovimiento.herramienta_id]);

  const bodegasDestino = useMemo(() => {
  if (!herramientaSeleccionadaMovimiento) return bodegaOptions;
  return bodegaOptions.filter(
    (b) => Number(b.id) !== Number(herramientaSeleccionadaMovimiento.bodega_id)
  );
}, [bodegaOptions, herramientaSeleccionadaMovimiento]);

  const movimientosHojaVida = useMemo(() => {
    if (!herramientaHojaVida) return [];

    return movimientos
      .filter(
        (m) =>
          m.herramienta_id === herramientaHojaVida.id ||
          m.codigo_interno === herramientaHojaVida.codigo_interno ||
          m.herramienta === herramientaHojaVida.nombre
      )
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [movimientos, herramientaHojaVida]);

  const reparacionesHojaVida = useMemo(() => {
    if (!herramientaHojaVida) return [];

    return reparaciones
      .filter(
        (r) =>
          r.herramienta_id === herramientaHojaVida.id ||
          r.codigo_interno === herramientaHojaVida.codigo_interno ||
          r.herramienta === herramientaHojaVida.nombre
      )
      .sort((a, b) => new Date(b.fecha_envio || 0) - new Date(a.fecha_envio || 0));
  }, [reparaciones, herramientaHojaVida]);

  const costoCompraHojaVida = useMemo(() => {
    if (!herramientaHojaVida) return 0;
    return Number(herramientaHojaVida.costo_compra || 0);
  }, [herramientaHojaVida]);

  const costoReparacionesHojaVida = useMemo(() => {
    return reparacionesHojaVida.reduce((acc, r) => acc + Number(r.costo_reparacion || 0), 0);
  }, [reparacionesHojaVida]);

  const costoTotalHojaVida = useMemo(() => {
    return costoCompraHojaVida + costoReparacionesHojaVida;
  }, [costoCompraHojaVida, costoReparacionesHojaVida]);

  const handleChangeHerramienta = (e) => {
    const { name, value } = e.target;
    setFormHerramienta((prev) => ({
      ...prev,
      [name]: name === "categoria_id" || name === "bodega_id" ? Number(value) : value,
    }));
  };

  const handleChangeMovimiento = (e) => {
    const { name, value } = e.target;
    setFormMovimiento((prev) => ({
      ...prev,
      [name]:
        name === "herramienta_id" || name === "bodega_destino" || name === "usuario_id"
          ? Number(value) || ""
          : value,
    }));
  };

  const handleChangeReparacion = (e) => {
    const { name, value } = e.target;
    setFormReparacion((prev) => ({
      ...prev,
      [name]: name === "herramienta_id" || name === "proveedor_id" ? Number(value) || "" : value,
    }));
  };

  const resetFormularioHerramienta = () => {
    setFormHerramienta({
      nombre: "",
      categoria_id: 1,
      marca: "",
      modelo: "",
      numero_serie: "",
      bodega_id: 1,
      fecha_compra: "",
      costo_compra: "",
      observaciones: "",
    });
  };

  const resetFormularioMovimiento = () => {
    setFormMovimiento({
      herramienta_id: "",
      bodega_destino: "",
      usuario_id: 1,
      observacion: "",
    });
  };

  const resetFormularioReparacion = () => {
    setFormReparacion({
      herramienta_id: "",
      proveedor_id: 1,
      descripcion_falla: "",
      fecha_envio: "",
      decision_final: "reparar",
      observaciones: "",
    });
  };

  const crearHerramienta = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formHerramienta.nombre || !formHerramienta.categoria_id || !formHerramienta.bodega_id) {
      setError("Nombre, categoría y bodega son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/herramientas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formHerramienta,
          costo_compra:
            formHerramienta.costo_compra === "" ? null : Number(formHerramienta.costo_compra),
          fecha_compra: formHerramienta.fecha_compra || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo crear la herramienta");
      }

      setSuccess("Herramienta creada correctamente.");
      setOpenNuevaHerramienta(false);
      resetFormularioHerramienta();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al crear la herramienta");
    }
  };

  const crearMovimiento = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!herramientaSeleccionadaMovimiento) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          herramienta_id: Number(formMovimiento.herramienta_id),
          bodega_origen: herramientaSeleccionadaMovimiento.bodega_id,
          bodega_destino: Number(formMovimiento.bodega_destino),
          usuario_id: 1,
          observacion: formMovimiento.observacion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo registrar el movimiento");
      }

      setSuccess("Movimiento registrado correctamente.");
      setOpenMovimiento(false);
      resetFormularioMovimiento();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al registrar el movimiento");
    }
  };

  const crearReparacion = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formReparacion.herramienta_id ||
      !formReparacion.proveedor_id ||
      !formReparacion.descripcion_falla ||
      !formReparacion.fecha_envio
    ) {
      setError("Herramienta, proveedor, falla y fecha de envío son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/reparaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formReparacion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo registrar la reparación");
      }

      setSuccess("Reparación registrada correctamente.");
      setOpenReparacion(false);
      resetFormularioReparacion();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al registrar la reparación");
    }
  };

  const darDeBaja = async (id) => {
    setError("");
    setSuccess("");

    const confirmar = window.confirm("¿Seguro que deseas dar de baja esta herramienta?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${apiBase}/herramientas/${id}/baja`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo dar de baja la herramienta");
      }

      setSuccess("Herramienta dada de baja correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al dar de baja la herramienta");
    }
  };

  const exportarHojaVidaPDF = () => {
    if (!herramientaHojaVida) return;

    try {
      const doc = new jsPDF("p", "mm", "a4");

      doc.setFontSize(16);
      doc.text("HOJA DE VIDA DE HERRAMIENTA", 14, 15);

      doc.setFontSize(11);
      doc.text(`Código: ${herramientaHojaVida.codigo_interno || "-"}`, 14, 24);
      doc.text(`Nombre: ${herramientaHojaVida.nombre || "-"}`, 14, 31);
      doc.text(`Marca: ${herramientaHojaVida.marca || "-"}`, 14, 38);
      doc.text(`Modelo: ${herramientaHojaVida.modelo || "-"}`, 14, 45);
      doc.text(`Número de serie: ${herramientaHojaVida.numero_serie || "-"}`, 14, 52);
      doc.text(`Bodega actual: ${herramientaHojaVida.bodega || "-"}`, 14, 59);
      doc.text(`Estado actual: ${herramientaHojaVida.estado || "-"}`, 14, 66);
      doc.text(`Costo de compra: $${costoCompraHojaVida.toLocaleString("es-CL")}`, 14, 73);
      doc.text(`Costo en reparaciones: $${costoReparacionesHojaVida.toLocaleString("es-CL")}`, 14, 80);
      doc.text(`Costo acumulado total: $${costoTotalHojaVida.toLocaleString("es-CL")}`, 14, 87);

      autoTable(doc, {
        startY: 95,
        head: [["Historial de movimientos"]],
        body: [[""]],
        theme: "plain",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        head: [["Fecha", "Origen", "Destino", "Observación"]],
        body:
          movimientosHojaVida.length > 0
            ? movimientosHojaVida.map((m) => [
                m.fecha ? new Date(m.fecha).toLocaleString("es-CL") : "-",
                m.bodega_origen || "-",
                m.bodega_destino || "-",
                m.observacion || "-",
              ])
            : [["-", "-", "-", "Sin movimientos registrados"]],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [["Historial de reparaciones"]],
        body: [[""]],
        theme: "plain",
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        head: [["Fecha envío", "Fecha retorno", "Proveedor", "Falla", "Estado", "Costo"]],
        body:
          reparacionesHojaVida.length > 0
            ? reparacionesHojaVida.map((r) => [
                r.fecha_envio ? new Date(r.fecha_envio).toLocaleDateString("es-CL") : "-",
                r.fecha_retorno ? new Date(r.fecha_retorno).toLocaleDateString("es-CL") : "-",
                r.proveedor || "-",
                r.descripcion_falla || "-",
                r.estado || "-",
                r.costo_reparacion ? `$${Number(r.costo_reparacion).toLocaleString("es-CL")}` : "-",
              ])
            : [["-", "-", "-", "Sin reparaciones registradas", "-", "-"]],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] },
      });

      doc.save(`hoja_de_vida_${herramientaHojaVida.codigo_interno || "herramienta"}.pdf`);
    } catch {
      setError("No se pudo exportar la hoja de vida a PDF");
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case "disponible":
        return { background: "#dcfce7", color: "#166534" };
      case "en_obra":
        return { background: "#dbeafe", color: "#1d4ed8" };
      case "en_reparacion":
        return { background: "#fef3c7", color: "#92400e" };
      case "baja":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#e5e7eb", color: "#374151" };
    }
  };

  return (
    <>
      <Modal open={openNuevaHerramienta} title="Nueva herramienta" onClose={() => setOpenNuevaHerramienta(false)}>
        <form onSubmit={crearHerramienta}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Nombre *"><input name="nombre" value={formHerramienta.nombre} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
            <Campo label="Categoría *">
              <select name="categoria_id" value={formHerramienta.categoria_id} onChange={handleChangeHerramienta} style={inputStyle}>
                <option value={1}>Herramienta Eléctrica</option>
                <option value={2}>Herramienta Manual</option>
                <option value={3}>Maquinaria</option>
                <option value={4}>Contenedor</option>
              </select>
            </Campo>
            <Campo label="Marca"><input name="marca" value={formHerramienta.marca} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
            <Campo label="Modelo"><input name="modelo" value={formHerramienta.modelo} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
            <Campo label="Número de serie"><input name="numero_serie" value={formHerramienta.numero_serie} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
            <Campo label="Bodega inicial *">
                <select
                  name="bodega_id"
                  value={formHerramienta.bodega_id}
                  onChange={handleChangeHerramienta}
                  style={inputStyle}
                >
                  <option value="">Selecciona una bodega</option>
                  {bodegaOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
            
            <Campo label="Fecha de compra"><input type="date" name="fecha_compra" value={formHerramienta.fecha_compra} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
            <Campo label="Costo de compra"><input type="number" name="costo_compra" value={formHerramienta.costo_compra} onChange={handleChangeHerramienta} style={inputStyle} /></Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observaciones">
              <textarea name="observaciones" value={formHerramienta.observaciones} onChange={handleChangeHerramienta} rows={4} style={{ ...inputStyle, resize: "vertical", width: "100%" }} />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setOpenNuevaHerramienta(false)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Guardar herramienta</button>
          </div>
        </form>
      </Modal>

      <Modal open={openMovimiento} title="Mover herramienta" onClose={() => setOpenMovimiento(false)}>
        <form onSubmit={crearMovimiento}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Herramienta">
              <input value={herramientaSeleccionadaMovimiento ? `${herramientaSeleccionadaMovimiento.codigo_interno} - ${herramientaSeleccionadaMovimiento.nombre}` : ""} disabled style={{ ...inputStyle, background: "#f3f4f6" }} />
            </Campo>
            <Campo label="Bodega destino *">
              <select name="bodega_destino" value={formMovimiento.bodega_destino} onChange={handleChangeMovimiento} style={inputStyle}>
                <option value="">Selecciona una bodega</option>
                {bodegasDestino.map((b) => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observación">
              <textarea name="observacion" value={formMovimiento.observacion} onChange={handleChangeMovimiento} rows={4} style={{ ...inputStyle, resize: "vertical", width: "100%" }} />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setOpenMovimiento(false)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ border: "none", background: "#7c3aed", color: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Registrar movimiento</button>
          </div>
        </form>
      </Modal>

      <Modal open={openReparacion} title="Enviar a reparación" onClose={() => setOpenReparacion(false)}>
        <form onSubmit={crearReparacion}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Herramienta">
              <input
                value={
                  formReparacion.herramienta_id
                    ? `${herramientas.find((h) => h.id === Number(formReparacion.herramienta_id))?.codigo_interno || ""} - ${herramientas.find((h) => h.id === Number(formReparacion.herramienta_id))?.nombre || ""}`
                    : ""
                }
                disabled
                style={{ ...inputStyle, background: "#f3f4f6" }}
              />
            </Campo>
            <Campo label="Proveedor *">
              <select name="proveedor_id" value={formReparacion.proveedor_id} onChange={handleChangeReparacion} style={inputStyle}>
                <option value={1}>Proveedor 1</option>
                <option value={2}>Proveedor 2</option>
                <option value={3}>Proveedor 3</option>
              </select>
            </Campo>
            <Campo label="Fecha de envío *"><input type="date" name="fecha_envio" value={formReparacion.fecha_envio} onChange={handleChangeReparacion} style={inputStyle} /></Campo>
            <Campo label="Decisión inicial">
              <select name="decision_final" value={formReparacion.decision_final} onChange={handleChangeReparacion} style={inputStyle}>
                <option value="reparar">Reparar</option>
                <option value="dar_baja">Dar baja</option>
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Descripción de falla *">
              <textarea name="descripcion_falla" value={formReparacion.descripcion_falla} onChange={handleChangeReparacion} rows={3} style={{ ...inputStyle, resize: "vertical", width: "100%" }} />
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Observaciones">
              <textarea name="observaciones" value={formReparacion.observaciones} onChange={handleChangeReparacion} rows={3} style={{ ...inputStyle, resize: "vertical", width: "100%" }} />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setOpenReparacion(false)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ border: "none", background: "#ea580c", color: "#fff", borderRadius: "10px", padding: "10px 16px", cursor: "pointer" }}>Registrar reparación</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openHojaVida}
        title={herramientaHojaVida ? `Hoja de vida - ${herramientaHojaVida.codigo_interno}` : "Hoja de vida"}
        onClose={() => setOpenHojaVida(false)}
        maxWidth="1000px"
      >
        {herramientaHojaVida && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#111827" }}>
                <div><strong>Código:</strong> {herramientaHojaVida.codigo_interno || "-"}</div>
                <div><strong>Nombre:</strong> {herramientaHojaVida.nombre || "-"}</div>
                <div><strong>Marca:</strong> {herramientaHojaVida.marca || "-"}</div>
                <div><strong>Modelo:</strong> {herramientaHojaVida.modelo || "-"}</div>
                <div><strong>N° Serie:</strong> {herramientaHojaVida.numero_serie || "-"}</div>
                <div><strong>Bodega actual:</strong> {herramientaHojaVida.bodega || "-"}</div>
                <div><strong>Estado:</strong> {herramientaHojaVida.estado || "-"}</div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "12px", color: "#1e3a8a" }}>
                  <strong>Costo de compra</strong>
                  <div>${costoCompraHojaVida.toLocaleString("es-CL")}</div>
                </div>
                <div style={{ background: "#fff7ed", padding: "14px", borderRadius: "12px", color: "#9a3412" }}>
                  <strong>Costo en reparaciones</strong>
                  <div>${costoReparacionesHojaVida.toLocaleString("es-CL")}</div>
                </div>
                <div style={{ background: "#ecfdf5", padding: "14px", borderRadius: "12px", color: "#166534" }}>
                  <strong>Costo acumulado total</strong>
                  <div>${costoTotalHojaVida.toLocaleString("es-CL")}</div>
                </div>
                <button
                  onClick={exportarHojaVidaPDF}
                  style={{
                    border: "none",
                    background: "#991b1b",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Exportar PDF
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ color: "#111827", marginBottom: "10px" }}>Historial de movimientos</h4>
              <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={th}>Fecha</th>
                      <th style={th}>Origen</th>
                      <th style={th}>Destino</th>
                      <th style={th}>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosHojaVida.length > 0 ? (
                      movimientosHojaVida.map((m) => (
                        <tr key={m.id}>
                          <td style={td}>{m.fecha ? new Date(m.fecha).toLocaleString("es-CL") : "-"}</td>
                          <td style={td}>{m.bodega_origen || "-"}</td>
                          <td style={td}>{m.bodega_destino || "-"}</td>
                          <td style={td}>{m.observacion || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={td} colSpan={4}>Sin movimientos registrados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 style={{ color: "#111827", marginBottom: "10px" }}>Historial de reparaciones</h4>
              <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={th}>Fecha envío</th>
                      <th style={th}>Fecha retorno</th>
                      <th style={th}>Proveedor</th>
                      <th style={th}>Falla</th>
                      <th style={th}>Estado</th>
                      <th style={th}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reparacionesHojaVida.length > 0 ? (
                      reparacionesHojaVida.map((r) => (
                        <tr key={r.id}>
                          <td style={td}>{r.fecha_envio ? new Date(r.fecha_envio).toLocaleDateString("es-CL") : "-"}</td>
                          <td style={td}>{r.fecha_retorno ? new Date(r.fecha_retorno).toLocaleDateString("es-CL") : "-"}</td>
                          <td style={td}>{r.proveedor || "-"}</td>
                          <td style={td}>{r.descripcion_falla || "-"}</td>
                          <td style={td}>{r.estado || "-"}</td>
                          <td style={td}>{r.costo_reparacion ? `$${Number(r.costo_reparacion).toLocaleString("es-CL")}` : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={td} colSpan={6}>Sin reparaciones registradas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Herramientas</h1>
          <p style={{ color: "#cbd5e1" }}>Listado, creación y acciones directas sobre herramientas.</p>
        </div>

        <button
          onClick={() => setOpenNuevaHerramienta(true)}
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
          Nueva herramienta
        </button>
      </div>
      <div style={{ color: "white", marginBottom: "10px" }}>
  Bodegas cargadas: {bodegas.length}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 260px",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <input
          placeholder="Buscar por código, nombre, marca o serie"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />

        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} style={inputStyle}>
          <option value="todos">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="en_obra">En obra</option>
          <option value="en_reparacion">En reparación</option>
          <option value="baja">Baja</option>
        </select>

        <select value={bodegaFiltro} onChange={(e) => setBodegaFiltro(e.target.value)} style={inputStyle}>
          <option value="todas">Todas las bodegas</option>
          {bodegasDisponibles.map((bodega) => (
            <option key={bodega} value={bodega}>{bodega}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px", color: "#cbd5e1" }}>
        {herramientasFiltradas.length} herramienta(s) encontradas
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Código</th>
              <th style={th}>Herramienta</th>
              <th style={th}>Marca</th>
              <th style={th}>Modelo</th>
              <th style={th}>Bodega</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {herramientasFiltradas.map((h) => (
              <tr key={h.id}>
                <td style={td}>{h.codigo_interno}</td>
                <td style={td}>{h.nombre}</td>
                <td style={td}>{h.marca || "-"}</td>
                <td style={td}>{h.modelo || "-"}</td>
                <td style={td}>{h.bodega || "-"}</td>
                <td style={td}>
                  <span
                    style={{
                      ...getEstadoStyle(h.estado),
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {h.estado}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setFormMovimiento({
                          herramienta_id: h.id,
                          bodega_destino: "",
                          usuario_id: 1,
                          observacion: "",
                        });
                        setOpenMovimiento(true);
                      }}
                      disabled={h.estado === "baja" || h.estado === "en_reparacion"}
                      style={{
                        background:
                          h.estado === "baja" || h.estado === "en_reparacion" ? "#9ca3af" : "#3b82f6",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor:
                          h.estado === "baja" || h.estado === "en_reparacion" ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Mover
                    </button>

                    <button
                      onClick={() => {
                        setFormReparacion({
                          herramienta_id: h.id,
                          proveedor_id: 1,
                          descripcion_falla: "",
                          fecha_envio: "",
                          decision_final: "reparar",
                          observaciones: "",
                        });
                        setOpenReparacion(true);
                      }}
                      disabled={h.estado === "baja" || h.estado === "en_reparacion"}
                      style={{
                        background:
                          h.estado === "baja" || h.estado === "en_reparacion" ? "#9ca3af" : "#f59e0b",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor:
                          h.estado === "baja" || h.estado === "en_reparacion" ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Reparar
                    </button>

                    <button
                      onClick={() => darDeBaja(h.id)}
                      disabled={h.estado === "baja"}
                      style={{
                        background: h.estado === "baja" ? "#9ca3af" : "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: h.estado === "baja" ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Baja
                    </button>

                    <button
                      onClick={() => {
                        setHerramientaHojaVida(h);
                        setOpenHojaVida(true);
                      }}
                      style={{
                        background: "#111827",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Hoja de vida
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}