const express = require("express");
const cors = require("cors");

const usuariosRoutes = require("./routes/usuarios.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const configuracionRoutes = require("./routes/configuracion.routes");
const reparacionesRoutes = require("./routes/reparaciones.routes");
const alertasRoutes = require("./routes/alertas.routes");
const herramientasRoutes = require("./routes/herramientas.routes");
const obrasRoutes = require("./routes/obras.routes");
const bodegasRoutes = require("./routes/bodegas.routes");
const movimientosRoutes = require("./routes/movimientos.routes");
const contenedoresRoutes = require("./routes/contenedores.routes");
const movimientosContenedoresRoutes = require("./routes/movimientos-contenedores.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/configuracion", configuracionRoutes);
app.use("/api/reparaciones", reparacionesRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/herramientas", herramientasRoutes);
app.use("/api/obras", obrasRoutes);
app.use("/api/bodegas", bodegasRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/contenedores", contenedoresRoutes);
app.use("/api/movimientos-contenedores", movimientosContenedoresRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/api", (req, res) => {
  res.send("API funcionando");
});

module.exports = app;