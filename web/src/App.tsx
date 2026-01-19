// App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import Grid from "./pages/Grid";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Header from "./components/Header";
import Demo from "./pages/Demo";

export default function App() {
  const location = useLocation();

  const hideHeader =
    location.pathname === "/login" || location.pathname === "/register";

  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen">
      {!hideHeader && <Header />}

      <main className={!hideHeader ? "pt-14" : ""}>
        <Routes>
          {/* Si connecté => "/" redirige vers "/grid" */}
          <Route
            path="/"
            element={token ? <Navigate to="/grid" replace /> : <HomePage />}
          />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/demo" element={<Demo />} />

          {/* Protected */}
          <Route
            path="/grid"
            element={
              <ProtectedRoute>
                <Grid />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

