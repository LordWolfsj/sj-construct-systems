import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import logoEmpresa from "../assets/logo.png";

const apiBase = "http://localhost:5000/api";

const EMPRESA = "SJ Construct";
const RESPONSABLE = "Administrador de Bodega";

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

export default function InventarioPage() {
  const [searchParams] = useSearchParams();

  const [herramientas, setHerramientas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [bodegaFiltro, setBodegaFiltro] = useState("todas");
  const [error, setError] = useState("");

  useEffect(() => {
    const bodegaUrl = searchParams.get("bodega");
    if (bodegaUrl) {
      setBodegaFiltro(bodegaUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setError("");
        const response = await fetch(`${apiBase}/herramientas`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("No se pudo cargar el inventario");
        }

        setHerramientas(data);
      } catch (err) {
        setError(err.message || "Error al cargar inventario");
      }
    };

    cargar();
  }, []);

  const bodegasDisponibles = useMemo(() => {
    const setBodegas = new Set(herramientas.map((h) => h.bodega).filter(Boolean));
    const lista = Array.from(setBodegas).sort((a, b) => a.localeCompare(b));
    const sinCentral = lista.filter((b) => b !== "Bodega Central");
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

  const resumenEstados = useMemo(() => {
    return {
      total: herramientasFiltradas.length,
      disponibles: herramientasFiltradas.filter((h) => h.estado === "disponible").length,
      enObra: herramientasFiltradas.filter((h) => h.estado === "en_obra").length,
      enReparacion: herramientasFiltradas.filter((h) => h.estado === "en_reparacion").length,
      baja: herramientasFiltradas.filter((h) => h.estado === "baja").length,
    };
  }, [herramientasFiltradas]);

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

  const tituloInventario =
    bodegaFiltro === "todas" ? "Inventario general" : `Inventario de ${bodegaFiltro}`;

  const fechaExportacion = new Date().toLocaleString("es-CL");

  const nombreArchivoBase = useMemo(() => {
    const base =
      bodegaFiltro === "todas"
        ? "inventario_general"
        : `inventario_${bodegaFiltro.toLowerCase().replace(/\s+/g, "_")}`;

    return base;
  }, [bodegaFiltro]);

  const getExportRows = () => {
    return herramientasFiltradas.map((h) => ({
      Código: h.codigo_interno || "",
      Herramienta: h.nombre || "",
      Marca: h.marca || "",
      Modelo: h.modelo || "",
      "Número de serie": h.numero_serie || "",
      Bodega: h.bodega || "",
      Estado: h.estado || "",
    }));
  };

  const aplicarEstilosExcel = (ws) => {
    const celdasEncabezado = [
      "A1", "A2", "A3", "A4", "A5",
      "A6", "A7", "A8", "A9", "A10"
    ];

    celdasEncabezado.forEach((celda) => {
      if (ws[celda]) {
        ws[celda].s = {
          font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
          fill: { fgColor: { rgb: "E5E7EB" } },
          alignment: { vertical: "center", horizontal: "left" },
        };
      }
    });

    const headers = ["A12", "B12", "C12", "D12", "E12", "F12", "G12"];
    headers.forEach((celda) => {
      if (ws[celda]) {
        ws[celda].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2563EB" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });
  };

  const exportarExcel = () => {
    try {
      const rows = getExportRows();

      const encabezado = [
        [EMPRESA],
        ["REPORTE DE INVENTARIO"],
        [tituloInventario],
        [`Fecha de exportación: ${fechaExportacion}`],
        [`Responsable: ${RESPONSABLE}`],
        [`Cantidad total: ${resumenEstados.total}`],
        [`Disponibles: ${resumenEstados.disponibles}`],
        [`En obra: ${resumenEstados.enObra}`],
        [`En reparación: ${resumenEstados.enReparacion}`],
        [`Baja: ${resumenEstados.baja}`],
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(encabezado);
      XLSX.utils.sheet_add_json(ws, rows, { origin: "A12" });

      ws["!cols"] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 28 },
        { wch: 16 },
      ];

      aplicarEstilosExcel(ws);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");

      XLSX.writeFile(wb, `${nombreArchivoBase}.xlsx`, { cellStyles: true });
    } catch (err) {
      setError("No se pudo exportar a Excel");
    }
  };

  const getImageBase64 = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });

  const exportarPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      try {
        const logoBase64 = await getImageBase64(logoEmpresa);
        doc.addImage(logoBase64, "PNG", 14, 10, 24, 24);
      } catch {
        // si falla el logo, sigue sin detener la exportación
      }

      doc.setFontSize(17);
      doc.text(EMPRESA, 42, 16);

      doc.setFontSize(15);
      doc.text("REPORTE DE INVENTARIO", 42, 23);

      doc.setFontSize(11);
      doc.text(tituloInventario, 42, 30);

      doc.setFontSize(9);
      doc.text(`Fecha de exportación: ${fechaExportacion}`, 14, 42);
      doc.text(`Responsable: ${RESPONSABLE}`, 14, 48);

      doc.text(
        `Total: ${resumenEstados.total} | Disponibles: ${resumenEstados.disponibles} | En obra: ${resumenEstados.enObra} | En reparación: ${resumenEstados.enReparacion} | Baja: ${resumenEstados.baja}`,
        14,
        54
      );

      autoTable(doc, {
        startY: 60,
        head: [[
          "Código",
          "Herramienta",
          "Marca",
          "Modelo",
          "Número de serie",
          "Bodega",
          "Estado",
        ]],
        body: herramientasFiltradas.map((h) => [
          h.codigo_interno || "",
          h.nombre || "",
          h.marca || "",
          h.modelo || "",
          h.numero_serie || "",
          h.bodega || "",
          h.estado || "",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [37, 99, 235],
        },
      });

      doc.save(`${nombreArchivoBase}.pdf`);
    } catch (err) {
      setError("No se pudo exportar a PDF");
    }
  };

  return (
    <>
      <h1>{tituloInventario}</h1>
      <p style={{ color: "#cbd5e1" }}>
        Consulta de herramientas por bodega y estado.
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 260px auto auto",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Buscar por código, nombre, marca o serie"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          style={inputStyle}
        >
          <option value="todos">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="en_obra">En obra</option>
          <option value="en_reparacion">En reparación</option>
          <option value="baja">Baja</option>
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

        <button
          onClick={exportarExcel}
          style={{
            border: "none",
            background: "#166534",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Exportar Excel
        </button>

        <button
          onClick={exportarPDF}
          style={{
            border: "none",
            background: "#991b1b",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Exportar PDF
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", color: "#111827" }}>
          <strong>Total</strong>
          <div>{resumenEstados.total}</div>
        </div>
        <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", color: "#111827" }}>
          <strong>Disponibles</strong>
          <div>{resumenEstados.disponibles}</div>
        </div>
        <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", color: "#111827" }}>
          <strong>En obra</strong>
          <div>{resumenEstados.enObra}</div>
        </div>
        <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", color: "#111827" }}>
          <strong>En reparación</strong>
          <div>{resumenEstados.enReparacion}</div>
        </div>
        <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", color: "#111827" }}>
          <strong>Baja</strong>
          <div>{resumenEstados.baja}</div>
        </div>
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
              <th style={th}>Número de serie</th>
              <th style={th}>Bodega</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {herramientasFiltradas.map((h) => (
              <tr key={h.id}>
                <td style={td}>{h.codigo_interno}</td>
                <td style={td}>{h.nombre}</td>
                <td style={td}>{h.marca || "-"}</td>
                <td style={td}>{h.modelo || "-"}</td>
                <td style={td}>{h.numero_serie || "-"}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}