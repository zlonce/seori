import { useEffect, useState } from "react";
import {
  getStaffListAPI,
  updateStaffProfileAPI,
  createUserAPI,
} from "../../api/user";
import {
  getAllSpecialDaysAPI,
  createSpecialDayAPI,
  deleteSpecialDayAPI,
} from "../../api/specialDay";
import { getStaffWorkRecordsAPI } from "../../api/workRecord";
import type { StaffSummary, UserRole } from "../../api/user";
import type { SpecialDayResponse } from "../../api/specialDay";
import styles from "./OwnerDashboard.module.css";

type Tab = "staff" | "wage" | "specialDays";

interface StaffWageData {
  userId: string;
  name: string;
  role: UserRole;
  regularWage: number;
  overtimeWage: number;
  totalWage: number;
}

export default function OwnerDashboard() {
  const [tab, setTab] = useState<Tab>("staff");
  const [staffList, setStaffList] = useState<StaffSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    hourlyWage: number;
    overtimeWage: number;
    weeklyWorkDays: number;
  }>({
    name: "",
    role: "STAFF",
    hourlyWage: 0,
    overtimeWage: 0,
    weeklyWorkDays: 2,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    phone: "",
    name: "",
    hourlyWage: 0,
    overtimeWage: 0,
    weeklyWorkDays: 2,
  });

  const now = new Date();

  const [wageYear, setWageYear] = useState(now.getFullYear());
  const [wageMonth, setWageMonth] = useState(now.getMonth() + 1);
  const [wageData, setWageData] = useState<StaffWageData[]>([]);
  const [wageLoading, setWageLoading] = useState(false);

  const [specialDays, setSpecialDays] = useState<SpecialDayResponse[]>([]);
  const [newSpecial, setNewSpecial] = useState({
    date: "",
    name: "",
    recurring: false,
  });

  const currentMonth = now.getMonth() + 1;

  const sortByCurrentMonth = (days: SpecialDayResponse[]) =>
    [...days].sort((a, b) => {
      const aMonth = new Date(a.date).getMonth() + 1;
      const bMonth = new Date(b.date).getMonth() + 1;
      const aOffset = (aMonth - currentMonth + 12) % 12;
      const bOffset = (bMonth - currentMonth + 12) % 12;
      if (aOffset !== bOffset) return aOffset - bOffset;
      return a.date.localeCompare(b.date);
    });

  const fetchStaff = () =>
    getStaffListAPI()
      .then(setStaffList)
      .catch(() => {});
  const fetchSpecial = () =>
    getAllSpecialDaysAPI()
      .then((data) => {
        const currentYear = now.getFullYear();
        const filtered = data.filter(
          (d) => d.recurring || new Date(d.date).getFullYear() >= currentYear,
        );
        setSpecialDays(sortByCurrentMonth(filtered));
      })
      .catch(() => {});

  const fetchWages = async (list: StaffSummary[]) => {
    if (list.length === 0) return;
    setWageLoading(true);
    try {
      const records = await Promise.all(
        list.map((s) => getStaffWorkRecordsAPI(s.userId, wageYear, wageMonth)),
      );
      setWageData(
        list.map((s, i) => {
          const completed = records[i].filter((r) => r.status === "COMPLETED");
          return {
            userId: s.userId,
            name: s.name,
            role: s.role,
            regularWage: completed.reduce((sum, r) => sum + r.regularWage, 0),
            overtimeWage: completed.reduce((sum, r) => sum + r.overtimeWage, 0),
            totalWage: completed.reduce((sum, r) => sum + r.totalWage, 0),
          };
        }),
      );
    } finally {
      setWageLoading(false);
    }
  };

  const prevWageMonth = () => {
    if (wageMonth === 1) {
      setWageYear((y) => y - 1);
      setWageMonth(12);
    } else setWageMonth((m) => m - 1);
  };
  const nextWageMonth = () => {
    if (wageMonth === 12) {
      setWageYear((y) => y + 1);
      setWageMonth(1);
    } else setWageMonth((m) => m + 1);
  };

  useEffect(() => {
    fetchStaff();
    fetchSpecial();
  }, []);

  useEffect(() => {
    if (tab === "wage") fetchWages(staffList);
  }, [tab, wageYear, wageMonth, staffList]);

  const startEdit = (s: StaffSummary) => {
    setEditingId(s.userId);
    setEditForm({
      name: s.name,
      role: s.role,
      hourlyWage: s.hourlyWage,
      overtimeWage: s.overtimeWage,
      weeklyWorkDays: s.weeklyWorkDays,
    });
  };

  const saveEdit = async (userId: string) => {
    await updateStaffProfileAPI(userId, editForm);
    setEditingId(null);
    fetchStaff();
  };

  const handleCreateStaff = async () => {
    await createUserAPI({ ...createForm, role: "STAFF" });
    setShowCreateForm(false);
    setCreateForm({
      phone: "",
      name: "",
      hourlyWage: 0,
      overtimeWage: 0,
      weeklyWorkDays: 2,
    });
    fetchStaff();
  };

  const handleAddSpecial = async () => {
    if (!newSpecial.date || !newSpecial.name) return;
    await createSpecialDayAPI(
      newSpecial.date,
      newSpecial.name,
      newSpecial.recurring,
    );
    setNewSpecial({ date: "", name: "", recurring: false });
    fetchSpecial();
  };

  const handleDeleteSpecial = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteSpecialDayAPI(id);
    fetchSpecial();
  };

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

      {tab === "staff" && (
        <div>
          <button
            className={styles.addBtn}
            onClick={() => setShowCreateForm(true)}
          >
            + 직원 추가
          </button>

          {showCreateForm && (
            <div className={styles.createCard}>
              <h4 className={styles.cardTitle}>새 직원 등록</h4>
              <InputRow
                label="이름"
                value={createForm.name}
                onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))}
              />
              <InputRow
                label="전화번호"
                value={createForm.phone}
                onChange={(v) => setCreateForm((f) => ({ ...f, phone: v }))}
                placeholder="01012345678"
              />
              <InputRow
                label="기본시급"
                value={String(createForm.hourlyWage)}
                onChange={(v) =>
                  setCreateForm((f) => ({ ...f, hourlyWage: Number(v) }))
                }
                type="number"
              />
              <InputRow
                label="초과시급"
                value={String(createForm.overtimeWage)}
                onChange={(v) =>
                  setCreateForm((f) => ({ ...f, overtimeWage: Number(v) }))
                }
                type="number"
              />
              <div className={styles.field}>
                <label className={styles.fieldLabel}>주당 근무일</label>
                <select
                  className={styles.select}
                  value={createForm.weeklyWorkDays}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      weeklyWorkDays: Number(e.target.value),
                    }))
                  }
                >
                  <option value={1}>1일</option>
                  <option value={2}>2일</option>
                </select>
              </div>
              <div className={styles.btnRow}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateForm(false)}
                >
                  취소
                </button>
                <button className={styles.saveBtn} onClick={handleCreateStaff}>
                  등록
                </button>
              </div>
            </div>
          )}

          {staffList.map((s) => (
            <div key={s.userId} className={styles.staffCard}>
              <div className={styles.staffName}>{s.name}</div>

              {editingId === s.userId ? (
                <div className={styles.editingWrap}>
                  <InputRow
                    label="이름"
                    value={editForm.name}
                    onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
                  />
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>역할</label>
                    <select
                      className={styles.select}
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          role: e.target.value as UserRole,
                        }))
                      }
                    >
                      <option value="STAFF">알바생</option>
                      <option value="MANAGER">매니저</option>
                    </select>
                  </div>
                  <InputRow
                    label="기본시급"
                    value={String(editForm.hourlyWage)}
                    onChange={(v) =>
                      setEditForm((f) => ({ ...f, hourlyWage: Number(v) }))
                    }
                    type="number"
                  />
                  <InputRow
                    label="초과시급"
                    value={String(editForm.overtimeWage)}
                    onChange={(v) =>
                      setEditForm((f) => ({ ...f, overtimeWage: Number(v) }))
                    }
                    type="number"
                  />
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>주당 근무일</label>
                    <select
                      className={styles.select}
                      value={editForm.weeklyWorkDays}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          weeklyWorkDays: Number(e.target.value),
                        }))
                      }
                    >
                      <option value={1}>1일</option>
                      <option value={2}>2일</option>
                    </select>
                  </div>
                  <div className={styles.btnRow}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </button>
                    <button
                      className={styles.saveBtn}
                      onClick={() => saveEdit(s.userId)}
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.staffInfo}>
                  <span>
                    {s.role === "MANAGER" ? "매니저" : "알바생"} · 기본{" "}
                    {s.hourlyWage.toLocaleString()}원 / 초과{" "}
                    {s.overtimeWage.toLocaleString()}원 / 주{s.weeklyWorkDays}일
                  </span>
                  <button
                    className={styles.editBtn}
                    onClick={() => startEdit(s)}
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "wage" && (
        <div>
          <div className={styles.monthNav}>
            <button className={styles.monthNavBtn} onClick={prevWageMonth}>
              {"<"}
            </button>
            <span className={styles.monthLabel}>
              {wageYear}년 {wageMonth}월
            </span>
            <button className={styles.monthNavBtn} onClick={nextWageMonth}>
              {">"}
            </button>
          </div>

          {wageLoading && <p className={styles.empty}>불러오는 중...</p>}

          {!wageLoading && wageData.length === 0 && (
            <p className={styles.empty}>직원 정보가 없습니다.</p>
          )}

          {!wageLoading &&
            wageData.map((w) => (
              <div key={w.userId} className={styles.wageCard}>
                <div className={styles.wageHeader}>
                  <span className={styles.wageName}>{w.name}</span>
                  <span
                    className={`${styles.roleBadge} ${w.role === "MANAGER" ? styles.roleBadgeManager : ""}`}
                  >
                    {w.role === "MANAGER" ? "매니저" : "알바생"}
                  </span>
                </div>
                <div className={styles.wageBreakdown}>
                  <div className={styles.wageRow}>
                    <span className={styles.wageLabel}>정규</span>
                    <span className={styles.wageAmount}>
                      {w.regularWage.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <div className={styles.wageRow}>
                    <span className={styles.wageLabel}>초과</span>
                    <span className={styles.wageAmount}>
                      {w.overtimeWage.toLocaleString("ko-KR")}원
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
                {wageData
                  .reduce((sum, w) => sum + w.totalWage, 0)
                  .toLocaleString("ko-KR")}
                원
              </span>
            </div>
          )}
        </div>
      )}

      {tab === "specialDays" && (
        <div>
          <div className={styles.specialAddRow}>
            <input
              className={styles.dateInput}
              type="date"
              value={newSpecial.date}
              onChange={(e) =>
                setNewSpecial((s) => ({ ...s, date: e.target.value }))
              }
            />
            <input
              className={styles.nameInput}
              placeholder="이름 (예: 크리스마스)"
              value={newSpecial.name}
              onChange={(e) =>
                setNewSpecial((s) => ({ ...s, name: e.target.value }))
              }
            />
          </div>
          <div className={styles.specialAddOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newSpecial.recurring}
                onChange={(e) =>
                  setNewSpecial((s) => ({ ...s, recurring: e.target.checked }))
                }
              />
              &nbsp;매년 반복
            </label>
            <button className={styles.smallAddBtn} onClick={handleAddSpecial}>
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
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteSpecial(d.id)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className={styles.inputRow}>
      <label className={styles.inputRowLabel}>{label}</label>
      <input
        className={styles.inputRowField}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
