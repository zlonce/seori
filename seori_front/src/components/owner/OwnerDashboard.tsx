import { useEffect, useState } from "react";
import { getStaffListAPI } from "../../api/user";
import type { StaffSummary } from "../../api/user";
import StaffTab from "./StaffTab";
import WageTab from "./WageTab";
import SpecialDaysTab from "./SpecialDaysTab";
import styles from "./OwnerDashboard.module.css";

type Tab = "staff" | "wage" | "specialDays";

export default function OwnerDashboard() {
  const [tab, setTab] = useState<Tab>("staff");
  const [staffList, setStaffList] = useState<StaffSummary[]>([]);

  const fetchStaff = () =>
    getStaffListAPI().then(setStaffList).catch(() => {});

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "staff" ? styles.activeTab : ""}`}
          onClick={() => setTab("staff")}
        >
          직원 관리
        </button>
        <button
          className={`${styles.tab} ${tab === "wage" ? styles.activeTab : ""}`}
          onClick={() => setTab("wage")}
        >
          월급 목록
        </button>
        <button
          className={`${styles.tab} ${tab === "specialDays" ? styles.activeTab : ""}`}
          onClick={() => setTab("specialDays")}
        >
          추가수당일
        </button>
      </div>

      {tab === "staff" && <StaffTab staffList={staffList} onRefresh={fetchStaff} />}
      {tab === "wage" && <WageTab staffList={staffList} />}
      {tab === "specialDays" && <SpecialDaysTab />}
    </div>
  );
}
