import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import styles from "./AppLayout.module.css";
import logoUrl from "../../assets/seori_logo.png";

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src={logoUrl} alt="서리 로고" className={styles.logo} />
        <div className={styles.headerRight}>
          <button className={styles.menuBtn} onClick={handleLogout}>
            로그아웃
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} color="#888" />
          </button>
        </div>
      </header>
      <div className={styles.body}>
        <Outlet />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
