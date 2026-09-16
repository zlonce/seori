import { useEffect, useState } from "react";
import {
  getActiveSpecialDaysAPI,
  createSpecialDayAPI,
  deleteSpecialDayAPI,
} from "../../api/specialDay";
import type { SpecialDayResponse } from "../../api/specialDay";
import styles from "./OwnerDashboard.module.css";

export default function SpecialDaysTab() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const [specialDays, setSpecialDays] = useState<SpecialDayResponse[]>([]);
  const [newSpecial, setNewSpecial] = useState({
    date: "",
    name: "",
    recurring: false,
  });

  const sortByCurrentMonth = (days: SpecialDayResponse[]) =>
    [...days].sort((a, b) => {
      const aMonth = new Date(a.date).getMonth() + 1;
      const bMonth = new Date(b.date).getMonth() + 1;
      const aOffset = (aMonth - currentMonth + 12) % 12;
      const bOffset = (bMonth - currentMonth + 12) % 12;
      if (aOffset !== bOffset) return aOffset - bOffset;
      return a.date.localeCompare(b.date);
    });

  const fetchSpecial = () =>
    getActiveSpecialDaysAPI(now.getFullYear())
      .then((data) => setSpecialDays(sortByCurrentMonth(data)))
      .catch(() => {});

  useEffect(() => {
    fetchSpecial();
  }, []);

  const handleAdd = async () => {
    if (!newSpecial.date || !newSpecial.name) return;
    await createSpecialDayAPI(newSpecial.date, newSpecial.name, newSpecial.recurring);
    setNewSpecial({ date: "", name: "", recurring: false });
    fetchSpecial();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteSpecialDayAPI(id);
    fetchSpecial();
  };

  return (
    <div>
      <div className={styles.specialAddRow}>
        <input
          className={styles.dateInput}
          type="date"
          value={newSpecial.date}
          onChange={(e) => setNewSpecial((s) => ({ ...s, date: e.target.value }))}
        />
        <input
          className={styles.nameInput}
          placeholder="이름 (예: 크리스마스)"
          value={newSpecial.name}
          onChange={(e) => setNewSpecial((s) => ({ ...s, name: e.target.value }))}
        />
      </div>
      <div className={styles.specialAddOptions}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={newSpecial.recurring}
            onChange={(e) => setNewSpecial((s) => ({ ...s, recurring: e.target.checked }))}
          />
          &nbsp;매년 반복
        </label>
        <button className={styles.smallAddBtn} onClick={handleAdd}>
          추가
        </button>
      </div>

      {specialDays.length === 0 && (
        <p className={styles.empty}>등록된 추가수당일이 없습니다.</p>
      )}
      {specialDays.map((d) => (
        <div key={d.id} className={styles.specialRow}>
          <span className={styles.specialDate}>
            {d.recurring ? d.date.slice(5) : d.date}
          </span>
          <span className={styles.specialName}>{d.name}</span>
          <button className={styles.deleteBtn} onClick={() => handleDelete(d.id)}>
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
