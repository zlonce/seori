import { useEffect, useState } from "react";
import { getMyWorkRecordsAPI } from "../../api/workRecord";
import { getSpecialDaysAPI } from "../../api/specialDay";
import type { WorkRecordResponse } from "../../api/workRecord";
import WorkCalendar from "./WorkCalendar";
import WageSummary from "./WageSummary";
import styles from "./StaffDashboard.module.css";

type Tab = "schedule" | "wage";

export default function StaffDashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [tab, setTab] = useState<Tab>("schedule");
  const [records, setRecords] = useState<WorkRecordResponse[]>([]);
  const [specialDates, setSpecialDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recs, specials] = await Promise.all([
        getMyWorkRecordsAPI(year, month),
        getSpecialDaysAPI(year, month),
      ]);
      setRecords(recs);
      setSpecialDates(new Set(specials.map((s) => s.date)));
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

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "schedule" ? styles.activeTab : ""}`}
          onClick={() => setTab("schedule")}
        >
          일정
        </button>
        <button
          className={`${styles.tab} ${tab === "wage" ? styles.activeTab : ""}`}
          onClick={() => setTab("wage")}
        >
          월급
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : tab === "schedule" ? (
        <WorkCalendar
          year={year}
          month={month}
          records={records}
          specialDates={specialDates}
          onRefresh={fetchData}
        />
      ) : (
        <WageSummary records={records} onRefresh={fetchData} />
      )}
    </div>
  );
}
