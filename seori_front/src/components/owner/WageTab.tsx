import { useEffect, useState } from "react";
import { getStaffWorkShiftsAPI } from "../../api/workShift";
import type { WorkShiftResponse } from "../../api/workShift";
import type { Staff } from "../../api/user";
import StaffWageDetailModal from "./StaffWageDetailModal";
import styles from "./OwnerDashboard.module.css";

interface StaffWageData {
  userId: string;
  name: string;
  hourlyRate: number;
  overtimeRate: number;
  regularMinutes: number;
  overtimeMinutes: number;
  regularWage: number;
  overtimeWage: number;
  totalWage: number;
  records: WorkShiftResponse[];
}

const fmt = (min: number) => `${Math.floor(min / 60)}H ${min % 60}M`;

interface Props {
  staffList: Staff[];
}

export default function WageTab({ staffList }: Props) {
  const now = new Date();
  const [wageYear, setWageYear] = useState(now.getFullYear());
  const [wageMonth, setWageMonth] = useState(now.getMonth() + 1);
  const [wageData, setWageData] = useState<StaffWageData[]>([]);
  const [wageLoading, setWageLoading] = useState(false);
  const [selected, setSelected] = useState<StaffWageData | null>(null);

  const prevMonth = () => {
    if (wageMonth === 1) { setWageYear((y) => y - 1); setWageMonth(12); }
    else setWageMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (wageMonth === 12) { setWageYear((y) => y + 1); setWageMonth(1); }
    else setWageMonth((m) => m + 1);
  };

  useEffect(() => {
    const fetchWages = async () => {
      if (staffList.length === 0) return;
      setWageLoading(true);
      try {
        const records = await Promise.all(
          staffList.map((s) => getStaffWorkShiftsAPI(s.userId, wageYear, wageMonth)),
        );
        setWageData(
          staffList
            .map((s, i) => ({
              userId: s.userId,
              name: s.name,
              hourlyRate: s.hourlyWage,
              overtimeRate: s.overtimeWage,
              regularMinutes: records[i].reduce((sum, r) => sum + r.regularMinutes, 0),
              overtimeMinutes: records[i].reduce((sum, r) => sum + r.overtimeMinutes, 0),
              regularWage: records[i].reduce((sum, r) => sum + r.regularWage, 0),
              overtimeWage: records[i].reduce((sum, r) => sum + r.overtimeWage, 0),
              totalWage: records[i].reduce((sum, r) => sum + r.totalWage, 0),
              records: records[i],
            }))
            .filter((w) => w.totalWage > 0),
        );
      } finally {
        setWageLoading(false);
      }
    };
    fetchWages();
  }, [wageYear, wageMonth, staffList]);

  return (
    <div>
      <div className={styles.monthNav}>
        <button className={styles.monthNavBtn} onClick={prevMonth}>{"<"}</button>
        <span className={styles.monthLabel}>{wageYear}년 {wageMonth}월</span>
        <button className={styles.monthNavBtn} onClick={nextMonth}>{">"}</button>
      </div>

      {wageLoading && <p className={styles.empty}>불러오는 중...</p>}

      {!wageLoading && wageData.length === 0 && (
        <p className={styles.empty}>이번 달 급여 내역이 없습니다.</p>
      )}

      {!wageLoading &&
        wageData.map((w) => (
          <div
            key={w.userId}
            className={styles.wageCard}
            onClick={() => setSelected(w)}
          >
            <div className={styles.wageHeader}>
              <span className={styles.wageName}>{w.name}</span>
            </div>
            <div className={styles.wageRate}>
              기본 {w.hourlyRate.toLocaleString("ko-KR")}원 / 초과{" "}
              {w.overtimeRate.toLocaleString("ko-KR")}원
            </div>
            <div className={styles.wageBreakdown}>
              <div className={styles.wageRow}>
                <span className={styles.wageLabel}>정규</span>
                <span className={styles.wageAmount}>
                  {w.regularWage.toLocaleString("ko-KR")}원 ({fmt(w.regularMinutes)})
                </span>
              </div>
              <div className={styles.wageRow}>
                <span className={styles.wageLabel}>초과</span>
                <span className={styles.wageAmount}>
                  {w.overtimeWage.toLocaleString("ko-KR")}원 ({fmt(w.overtimeMinutes)})
                </span>
              </div>
            </div>
            <div className={styles.wageTotalRow}>
              <span className={styles.wageTotalLabel}>합계</span>
              <span className={styles.wageTotalAmount}>
                {w.totalWage.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
        ))}

      {!wageLoading && wageData.length > 0 && (
        <div className={styles.grandTotal}>
          <span className={styles.grandTotalLabel}>이번 달 총 인건비</span>
          <span className={styles.grandTotalAmount}>
            {wageData.reduce((sum, w) => sum + w.totalWage, 0).toLocaleString("ko-KR")}원
          </span>
        </div>
      )}

      {selected && (
        <StaffWageDetailModal
          name={selected.name}
          records={selected.records}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
