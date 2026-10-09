import type { ScheduleVote } from "../../api/schedule";
import { DAY_KO, formatShort } from "./scheduleUtils";
import styles from "./SchedulePage.module.css";

interface Props {
  businessDates: Array<{ date: string; dayIdx: number }>;
  votesFor: (date: string) => ScheduleVote[];
  myId: string;
}

export default function VoteTable({ businessDates, votesFor, myId }: Props) {
  return (
    <div className={styles.dateRows}>
      {businessDates.map(({ date, dayIdx }) => {
        const dayVotes = votesFor(date);
        return (
          <div key={date} className={styles.dateRow}>
            <div className={styles.dateLabel}>
              <span className={styles.dayNameBold}>{DAY_KO[dayIdx]}</span>
              <span className={styles.daySmDate}>{formatShort(date)}</span>
            </div>
            <div className={styles.tagRow}>
              {dayVotes.length === 0 ? (
                <span className={styles.noOne}>없음</span>
              ) : (
                dayVotes.map((v) => (
                  <span
                    key={v.userId}
                    className={`${styles.voterTag} ${v.userId === myId ? styles.voterTagMe : ""}`}
                  >
                    {v.userName}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
