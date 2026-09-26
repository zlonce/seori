import { useState } from "react";
import { updateStaffProfileAPI, createUserAPI } from "../../api/user";
import type { StaffSummary, UserRole } from "../../api/user";
import styles from "./OwnerDashboard.module.css";

interface Props {
  staffList: StaffSummary[];
  onRefresh: () => void;
}

export default function StaffTab({ staffList, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    hourlyWage: number;
    overtimeWage: number;
    password: string;
  }>({
    name: "",
    role: "STAFF",
    hourlyWage: 0,
    overtimeWage: 0,
    password: "",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    phone: "",
    name: "",
    hourlyWage: 0,
    overtimeWage: 0,
    password: "",
  });

  const startEdit = (s: StaffSummary) => {
    setEditingId(s.userId);
    setEditForm({
      name: s.name,
      role: s.role,
      hourlyWage: s.hourlyWage,
      overtimeWage: s.overtimeWage,
      password: "",
    });
  };

  const saveEdit = async (userId: string) => {
    const { password, ...rest } = editForm;
    await updateStaffProfileAPI(userId, password ? editForm : rest);
    setEditingId(null);
    onRefresh();
  };

  const handleCreateStaff = async () => {
    await createUserAPI({ ...createForm, role: "STAFF" });
    setShowCreateForm(false);
    setCreateForm({ phone: "", name: "", hourlyWage: 0, overtimeWage: 0, password: "" });
    onRefresh();
  };

  return (
    <div>
      <button className={styles.addBtn} onClick={() => setShowCreateForm(true)}>
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
            label="비밀번호"
            value={createForm.password}
            onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))}
            type="password"
          />
          <InputRow
            label="기본시급"
            value={String(createForm.hourlyWage)}
            onChange={(v) => setCreateForm((f) => ({ ...f, hourlyWage: Number(v) }))}
            type="number"
          />
          <InputRow
            label="초과시급"
            value={String(createForm.overtimeWage)}
            onChange={(v) => setCreateForm((f) => ({ ...f, overtimeWage: Number(v) }))}
            type="number"
          />
          <div className={styles.btnRow}>
            <button className={styles.cancelBtn} onClick={() => setShowCreateForm(false)}>
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
                    setEditForm((f) => ({ ...f, role: e.target.value as UserRole }))
                  }
                >
                  <option value="STAFF">알바생</option>
                  <option value="MANAGER">매니저</option>
                </select>
              </div>
              <InputRow
                label="기본시급"
                value={String(editForm.hourlyWage)}
                onChange={(v) => setEditForm((f) => ({ ...f, hourlyWage: Number(v) }))}
                type="number"
              />
              <InputRow
                label="초과시급"
                value={String(editForm.overtimeWage)}
                onChange={(v) => setEditForm((f) => ({ ...f, overtimeWage: Number(v) }))}
                type="number"
              />
              <InputRow
                label="비밀번호"
                value={editForm.password}
                onChange={(v) => setEditForm((f) => ({ ...f, password: v }))}
                type="password"
                placeholder="변경할 때만 입력"
              />
              <div className={styles.btnRow}>
                <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>
                  취소
                </button>
                <button className={styles.saveBtn} onClick={() => saveEdit(s.userId)}>
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.staffInfo}>
              <span>
                {s.role === "MANAGER" ? "매니저" : "알바생"} · 기본{" "}
                {s.hourlyWage.toLocaleString()}원 / 초과{" "}
                {s.overtimeWage.toLocaleString()}원
              </span>
              <button className={styles.editBtn} onClick={() => startEdit(s)}>
                수정
              </button>
            </div>
          )}
        </div>
      ))}
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
