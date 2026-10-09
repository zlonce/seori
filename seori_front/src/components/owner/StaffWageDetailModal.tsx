import type { WorkShiftResponse } from "../../api/workShift";
import styles from "./StaffWageDetailModal.module.css";

interface Props {
  name: string;
  records: WorkShiftResponse[];
  onClose: () => void;
}

export default function StaffWageDetailModal({ name, records, onClose }: Props) {
  const completed = records
    .filter((r) => r.startTime !== null)
    .sort((a, b) => a.workDate.localeCompare(b.workDate));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{name}님 근무 내역</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {completed.length === 0 ? (
          <p className={styles.empty}>저장된 근무 기록이 없습니다.</p>
        ) : (
          <div className={styles.list}>
            {completed.map((r) => (
              <div key={r.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.date}>{r.workDate}</span>
                  <span className={styles.time}>
                    {r.startTime} ~ {r.endTime}
                  </span>
                </div>
                <span className={styles.wage}>
                  {r.totalWage.toLocaleString("ko-KR")}원
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
