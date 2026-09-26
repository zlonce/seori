import { useState } from "react";
import { changePasswordAPI } from "../../api/auth";
import styles from "./PasswordChangeModal.module.css";

interface Props {
  onClose: () => void;
}

export default function PasswordChangeModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newPassword.length < 4 || newPassword.length > 20) {
      setError("새 비밀번호는 4~20자로 입력해주세요");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }

    setSubmitting(true);
    setError("");
    const result = await changePasswordAPI(currentPassword, newPassword);
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error ?? "비밀번호 변경에 실패했습니다");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h4 className={styles.title}>비밀번호 변경</h4>

        <div className={styles.field}>
          <label className={styles.label}>현재 비밀번호</label>
          <input
            className={styles.input}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>새 비밀번호</label>
          <input
            className={styles.input}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>새 비밀번호 확인</label>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.btns}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
}
