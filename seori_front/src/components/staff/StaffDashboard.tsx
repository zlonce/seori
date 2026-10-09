import { useEffect, useState } from "react";
import { getMyWorkShiftsAPI } from "../../api/workShift";
import type { WorkShiftResponse } from "../../api/workShift";
import WageSummary from "./WageSummary";
import styles from "./StaffDashboard.module.css";

export default function StaffDashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<WorkShiftResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const recs = await getMyWorkShiftsAPI(year, month);
      setRecords(recs);
    } catch {
      // 인증 에러는 interceptor에서 처리
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div>
      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={prevMonth}>{"<"}</button>
        <span className={styles.monthLabel}>{year}년 {month}월</span>
        <button className={styles.navBtn} onClick={nextMonth}>{">"}</button>
      </div>

      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : (
        <WageSummary records={records} onRefresh={fetchData} />
      )}
    </div>
  );
}
