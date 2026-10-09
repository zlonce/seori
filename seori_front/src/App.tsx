import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import StaffDashboard from "./components/staff/StaffDashboard";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import SchedulePage from "./components/schedule/SchedulePage";
import NoticePage from "./components/notice/NoticePage";
import MemoPage from "./components/memo/MemoPage";
import InventoryPage from "./components/inventory/InventoryPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard/owner" element={<OwnerDashboard />} />
              <Route path="/dashboard/staff" element={<StaffDashboard />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/memo" element={<MemoPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;