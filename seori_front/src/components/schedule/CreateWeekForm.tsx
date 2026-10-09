import { DAY_KO, formatWeekRange } from "./scheduleUtils";
import styles from "./SchedulePage.module.css";

interface Props {
  nextWeekStart: string;
  newWeekDays: boolean[];
  setNewWeekDays: React.Dispatch<React.SetStateAction<boolean[]>>;
  votingDeadline: string;
  setVotingDeadline: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function CreateWeekForm({
  nextWeekStart,
  newWeekDays,
  setNewWeekDays,
  votingDeadline,
  setVotingDeadline,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className={styles.createForm}>
      <div className={styles.createFormHeader}>
        <span className={styles.createFormLabel}>새 투표 주간</span>
        <span className={styles.createFormWeek}>{formatWeekRange(nextWeekStart)}</span>
      </div>
      <p className={styles.createFormHint}>영업일 선택 (화요일 기본 휴무)</p>
      <div className={styles.dayToggleGrid}>
        {DAY_KO.map((day, i) => (
          <button
            key={i}
            className={`${styles.dayToggleBtn} ${newWeekDays[i] ? styles.dayToggleBtnOn : styles.dayToggleBtnOff}`}
            onClick={() => setNewWeekDays((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          >
            {day}
          </button>
        ))}
      </div>
      <p className={styles.createFormHint} style={{ marginTop: 14 }}>투표 마감일</p>
      <input
        type="datetime-local"
        className={styles.deadlineInput}
        value={votingDeadline}
        onChange={(e) => setVotingDeadline(e.target.value)}
      />
      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.submitBtn} onClick={onSubmit}>생성</button>
      </div>
    </div>
  );
}
