import { useEffect, useState } from "react";

import { apiBase } from "../config";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    username: "",
    password: "",
    rol: "operador",
  });

  const cargarUsuarios = async () => {
    const res = await fetch(`${api}/usuarios`);
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const crearUsuario = async () => {
    await fetch(`${api}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      nombre: "",
      username: "",
      password: "",
      rol: "operador",
    });

    cargarUsuarios();
  };

  const toggleActivo = async (id, activo) => {
    await fetch(`${api}/usuarios/${id}/toggle`, {
      method: "PUT",
    });

    cargarUsuarios();
  };

  return (
    <div>
      <h1>Usuarios</h1>

      {/* FORM */}
      <div style={{ marginBottom: "20px", background: "#000000", padding: "20px", borderRadius: "12px" }}>
        <h3>Crear usuario</h3>

        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="operador">Operador</option>
        </select>

        <button onClick={crearUsuario}>Crear</button>
      </div>

      {/* TABLA */}
      <table style={{ width: "100%", background: "#000000" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.username}</td>
              <td>{u.rol}</td>
              <td>{u.activo ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => toggleActivo(u.id, u.activo)}>
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}