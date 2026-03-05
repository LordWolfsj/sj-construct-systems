const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "SJ Construct Systems Backend Activo 🚀" });
});

// Probar conexión a base de datos
app.get("/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    res.json({ conexion: "OK", fechaServidor: result });
  } catch (error) {
    res.status(500).json({ error: "Error conectando a la base de datos" });
  }
});

app.post("/herramientas", async (req, res) => {
  try {
    const herramienta = await prisma.herramienta.create({
      data: req.body,
    });
    res.json(herramienta);
  } catch (error) {
    res.status(500).json({ error: "Error creando herramienta" });
  }
});

app.post("/obras", async (req, res) => {
  try {
    const obra = await prisma.obra.create({
      data: req.body,
    });
    res.json(obra);
  } catch (error) {
    res.status(500).json({ error: "Error creando obra" });
  }
});

app.get("/bodega", async (req, res) => {
  const herramientas = await prisma.herramienta.findMany({
    where: { estado: "disponible" },
  });
  res.json(herramientas);
});

app.post("/asignar", async (req, res) => {
  const { herramientaId, obraId } = req.body;

  try {
    await prisma.herramienta.update({
      where: { id: herramientaId },
      data: { estado: "en_obra" },
    });

    const movimiento = await prisma.movimiento.create({
      data: {
        herramientaId,
        obraId,
        tipoMovimiento: "asignacion",
      },
    });

    res.json({ mensaje: "Herramienta asignada", movimiento });
  } catch (error) {
    res.status(500).json({ error: "Error asignando herramienta" });
  }
});

// Ver herramientas por obra
app.get("/obra/:id", async (req, res) => {
  const obraId = parseInt(req.params.id);

  try {
    const herramientas = await prisma.movimiento.findMany({
      where: {
        obraId: obraId,
        tipoMovimiento: "asignacion"
      },
      include: {
        herramienta: true
      }
    });

    res.json(herramientas);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo herramientas de la obra" });
  }
});

const PORT = process.env.PORT || 3000;

// Dashboard Estadisticas
app.get("/dashboard", async (req, res) => {

  const totalHerramientas = await prisma.herramienta.count()

  const enBodega = await prisma.herramienta.count({
    where:{estado:"disponible"}
  })

  const enObra = await prisma.herramienta.count({
    where:{estado:"en_obra"}
  })

  const totalObras = await prisma.obra.count()

  res.json({
    totalHerramientas,
    enBodega,
    enObra,
    totalObras
  })

})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.get("/obras", async (req, res) => {

  const obras = await prisma.obra.findMany()

  res.json(obras)

})

app.get("/herramientas", async (req, res) => {

  const herramientas = await prisma.herramienta.findMany()

  res.json(herramientas)

})