import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

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
          maxWidth: "900px",
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

export default function ContenedoresPage() {
  const [contenedores, setContenedores] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [bodegaFiltro, setBodegaFiltro] = useState("todas");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);

  const [form, setForm] = useState({
    numero_manual: "",
    tipo: "Oficina",
    bodega_id: "",
    detalle_exterior: "",
    detalle_interior: "",
  });

  const [formEditar, setFormEditar] = useState({
    id: "",
    numero_manual: "",
    tipo: "Oficina",
    bodega_id: "",
    detalle_exterior: "",
    detalle_interior: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError("");

      const [contenedoresRes, bodegasRes] = await Promise.all([
        fetch(`${apiBase}/contenedores`),
        fetch(`${apiBase}/bodegas`),
      ]);

      const contenedoresData = await contenedoresRes.json();
      const bodegasData = await bodegasRes.json();

      setContenedores(Array.isArray(contenedoresData) ? contenedoresData : []);
      setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
    } catch (err) {
      setError("No se pudieron cargar los contenedores");
    }
  };

  const tiposDisponibles = useMemo(() => {
    const tipos = [...new Set(contenedores.map((c) => c.tipo).filter(Boolean))];
    return tipos.sort((a, b) => a.localeCompare(b));
  }, [contenedores]);

  const bodegasDisponibles = useMemo(() => {
    const nombres = [...new Set(contenedores.map((c) => c.bodega_nombre).filter(Boolean))];
    return nombres.sort((a, b) => a.localeCompare(b));
  }, [contenedores]);

  const contenedoresFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return contenedores.filter((c) => {
      const coincideBusqueda =
        !q ||
        [
          c.numero_manual,
          c.codigo_interno,
          c.tipo,
          c.bodega_nombre,
          c.detalle_exterior,
          c.detalle_interior,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));

      const coincideTipo = tipoFiltro === "todos" || c.tipo === tipoFiltro;
      const coincideBodega = bodegaFiltro === "todas" || c.bodega_nombre === bodegaFiltro;

      return coincideBusqueda && coincideTipo && coincideBodega;
    });
  }, [contenedores, busqueda, tipoFiltro, bodegaFiltro]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "bodega_id" ? Number(value) || "" : value,
    }));
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setFormEditar((prev) => ({
      ...prev,
      [name]: name === "bodega_id" || name === "id" ? Number(value) || "" : value,
    }));
  };

  const resetForm = () => {
    setForm({
      numero_manual: "",
      tipo: "Oficina",
      bodega_id: "",
      detalle_exterior: "",
      detalle_interior: "",
    });
  };

  const resetFormEditar = () => {
    setFormEditar({
      id: "",
      numero_manual: "",
      tipo: "Oficina",
      bodega_id: "",
      detalle_exterior: "",
      detalle_interior: "",
    });
  };

  const crearContenedor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.numero_manual || !form.tipo || !form.bodega_id) {
      setError("Número manual, tipo y bodega son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/contenedores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo crear el contenedor");
      }

      setSuccess("Contenedor creado correctamente.");
      setOpenNuevo(false);
      resetForm();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al crear contenedor");
    }
  };

  const abrirEditar = (contenedor) => {
    setFormEditar({
      id: contenedor.id,
      numero_manual: contenedor.numero_manual || "",
      tipo: contenedor.tipo || "Oficina",
      bodega_id: Number(contenedor.bodega_id) || "",
      detalle_exterior: contenedor.detalle_exterior || "",
      detalle_interior: contenedor.detalle_interior || "",
    });
    setOpenEditar(true);
  };

  const editarContenedor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formEditar.numero_manual || !formEditar.tipo || !formEditar.bodega_id) {
      setError("Número manual, tipo y bodega son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/contenedores/${formEditar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formEditar),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo editar el contenedor");
      }

      setSuccess("Contenedor editado correctamente.");
      setOpenEditar(false);
      resetFormEditar();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al editar contenedor");
    }
  };

  const eliminarContenedor = async (id) => {
    setError("");
    setSuccess("");

    const confirmar = window.confirm("¿Seguro que deseas eliminar este contenedor?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${apiBase}/contenedores/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detalle || data?.error || "No se pudo eliminar el contenedor");
      }

      setSuccess("Contenedor eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al eliminar contenedor");
    }
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF("landscape", "mm", "a4");

      doc.setFontSize(18);
      doc.text("Listado de Contenedores", 14, 15);

      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleString("es-CL")}`, 14, 22);
      doc.text(`Filtro tipo: ${tipoFiltro === "todos" ? "Todos" : tipoFiltro}`, 14, 28);
      doc.text(`Filtro bodega: ${bodegaFiltro === "todas" ? "Todas" : bodegaFiltro}`, 100, 28);

      autoTable(doc, {
        startY: 34,
        head: [[
          "Número",
          "Código interno",
          "Tipo",
          "Bodega",
          "Detalle exterior",
          "Detalle interior",
        ]],
        body: contenedoresFiltrados.map((c) => [
          c.numero_manual || "-",
          c.codigo_interno || "-",
          c.tipo || "-",
          c.bodega_nombre || "-",
          c.detalle_exterior || "-",
          c.detalle_interior || "-",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      doc.save("contenedores.pdf");
    } catch (err) {
      setError("No se pudo exportar a PDF");
    }
  };

  return (
    <>
      <Modal open={openNuevo} title="Nuevo contenedor" onClose={() => setOpenNuevo(false)}>
        <form onSubmit={crearContenedor}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Número manual *">
              <input
                name="numero_manual"
                value={form.numero_manual}
                onChange={handleChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Tipo de contenedor *">
              <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
                <option value="Oficina">Oficina</option>
                <option value="Bodega">Bodega</option>
                <option value="Baño">Baño</option>
                <option value="Duchas">Duchas</option>
                <option value="Mixto">Mixto</option>
              </select>
            </Campo>

            <Campo label="Bodega *">
              <select name="bodega_id" value={form.bodega_id} onChange={handleChange} style={inputStyle}>
                <option value="">Selecciona una bodega</option>
                {bodegas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Detalle exterior">
              <textarea
                name="detalle_exterior"
                value={form.detalle_exterior}
                onChange={handleChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Detalle interior">
              <textarea
                name="detalle_interior"
                value={form.detalle_interior}
                onChange={handleChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setOpenNuevo(false)}
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
                background: "#2563eb",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Guardar contenedor
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={openEditar} title="Editar contenedor" onClose={() => setOpenEditar(false)}>
        <form onSubmit={editarContenedor}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Campo label="Número manual *">
              <input
                name="numero_manual"
                value={formEditar.numero_manual}
                onChange={handleEditarChange}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Tipo de contenedor *">
              <select name="tipo" value={formEditar.tipo} onChange={handleEditarChange} style={inputStyle}>
                <option value="Oficina">Oficina</option>
                <option value="Bodega">Bodega</option>
                <option value="Baño">Baño</option>
                <option value="Duchas">Duchas</option>
                <option value="Mixto">Mixto</option>
              </select>
            </Campo>

            <Campo label="Bodega *">
              <select name="bodega_id" value={formEditar.bodega_id} onChange={handleEditarChange} style={inputStyle}>
                <option value="">Selecciona una bodega</option>
                {bodegas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Detalle exterior">
              <textarea
                name="detalle_exterior"
                value={formEditar.detalle_exterior}
                onChange={handleEditarChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Campo label="Detalle interior">
              <textarea
                name="detalle_interior"
                value={formEditar.detalle_interior}
                onChange={handleEditarChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setOpenEditar(false)}
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
                background: "#16a34a",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Contenedores</h1>
          <p style={{ color: "#cbd5e1" }}>
            Gestión de contenedores asignados a bodegas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={exportarPDF}
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

          <button
            onClick={() => setOpenNuevo(true)}
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
            Nuevo contenedor
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 260px",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <input
          placeholder="Buscar por número, código, tipo o bodega"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          style={inputStyle}
        >
          <option value="todos">Todos los tipos</option>
          {tiposDisponibles.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <select
          value={bodegaFiltro}
          onChange={(e) => setBodegaFiltro(e.target.value)}
          style={inputStyle}
        >
          <option value="todas">Todas las bodegas</option>
          {bodegasDisponibles.map((bodega) => (
            <option key={bodega} value={bodega}>
              {bodega}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px", color: "#cbd5e1" }}>
        {contenedoresFiltrados.length} contenedor(es) encontrados
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Número</th>
              <th style={th}>Código interno</th>
              <th style={th}>Tipo</th>
              <th style={th}>Bodega</th>
              <th style={th}>Detalle exterior</th>
              <th style={th}>Detalle interior</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contenedoresFiltrados.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.numero_manual}</td>
                <td style={td}>{c.codigo_interno}</td>
                <td style={td}>{c.tipo}</td>
                <td style={td}>{c.bodega_nombre}</td>
                <td style={td}>{c.detalle_exterior || "-"}</td>
                <td style={td}>{c.detalle_interior || "-"}</td>
                <td style={td}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => abrirEditar(c)}
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarContenedor(c.id)}
                      style={{
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
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