const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");

router.post("/login", usuariosController.login);
router.get("/", usuariosController.listarUsuarios);
router.post("/", usuariosController.crearUsuario);
router.put("/:id/toggle", usuariosController.toggleUsuario);

module.exports = router;