import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import InventarioPage from "./pages/InventarioPage";
import HerramientasPage from "./pages/HerramientasPage";
import BodegasPage from "./pages/BodegasPage";
import MovimientosPage from "./pages/MovimientosPage";
import ReparacionesPage from "./pages/ReparacionesPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import UsuariosPage from "./pages/UsuariosPage";
import ContenedoresPage from "./pages/ContenedoresPage";

function PrivateLayout({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: "30px",
          background: "#0f172a",
          color: "white",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function SoloAdmin({ children }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateLayout>
            <DashboardPage />
          </PrivateLayout>
        }
      />

      <Route
        path="/inventario"
        element={
          <PrivateLayout>
            <InventarioPage />
          </PrivateLayout>
        }
      />

      <Route
        path="/herramientas"
        element={
          <PrivateLayout>
            <HerramientasPage />
          </PrivateLayout>
        }
      />

      <Route
        path="/bodegas"
        element={
          <PrivateLayout>
            <BodegasPage />
          </PrivateLayout>
        }
      />

      <Route
        path="/movimientos"
        element={
          <PrivateLayout>
            <SoloAdmin>
              <MovimientosPage />
            </SoloAdmin>
          </PrivateLayout>
        }
      />

      <Route
        path="/reparaciones"
        element={
          <PrivateLayout>
            <SoloAdmin>
              <ReparacionesPage />
            </SoloAdmin>
          </PrivateLayout>
        }
      />

      <Route
  path="/usuarios"
  element={
    <PrivateLayout>
      <SoloAdmin>
        <UsuariosPage />
      </SoloAdmin>
    </PrivateLayout>
  }
/>

  <Route
  path="/contenedores"
  element={
    <PrivateLayout>
      <ContenedoresPage />
    </PrivateLayout>
  }
/>

      <Route
        path="/configuracion"
        element={
          <PrivateLayout>
            <SoloAdmin>
              <ConfiguracionPage />
            </SoloAdmin>
          </PrivateLayout>
        }
      />
    </Routes>
  );
}