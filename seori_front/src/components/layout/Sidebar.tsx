import { useNavigate } from "react-router-dom";
import { X, Calendar, Megaphone, FileText, Package, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "일정", path: "/schedule", icon: Calendar },
  { label: "공지", path: "/notice", icon: Megaphone },
  { label: "메모", path: "/memo", icon: FileText },
  { label: "재고", path: "/inventory", icon: Package },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath =
    user?.role === "ROLE_OWNER" ? "/dashboard/owner" : "/dashboard/staff";
  const dashboardLabel = user?.role === "ROLE_OWNER" ? "운영" : "월급";

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        <nav className={styles.nav}>
          <button
            className={styles.navItem}
            onClick={() => handleNavigate(dashboardPath)}
          >
            <LayoutDashboard size={18} />
            <span>{dashboardLabel}</span>
          </button>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={styles.navItem}
              onClick={() => handleNavigate(item.path)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
