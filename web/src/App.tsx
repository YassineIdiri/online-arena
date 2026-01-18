import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import Grid from "./pages/Grid";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Header from "./components/Header";

export default function App() {
  const location = useLocation();

  // optionnel : cacher le header sur login/register si tu veux un écran clean
  const hideHeader = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen">
      {!hideHeader && <Header />}

      {/* Header fait h-14 (56px) et fixed => on push le contenu */}
      <main className={!hideHeader ? "pt-14" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Grid />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
