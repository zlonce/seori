import { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./LoginForm.module.css";
import { validateLoginForm } from "../../utils/validators";
import { loginAPI } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../context/AuthContext";

interface LoginFormProps {
  onLoginSuccess?: (user: User) => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { login } = useAuth();

  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: "" }));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    const validation = validateLoginForm(userId, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAPI(userId, password);

      if (result.success) {
        const user = login(result.accessToken);
        if (user && onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else {
        setApiError(result.error || "로그인에 실패했습니다");
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiError("로그인 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.logoContainer}>
        <img
          src="/src/assets/seori_logo.png"
          alt="서리 로고"
          className={styles.logo}
        />
      </div>

      {apiError && <div className={styles.apiError}>{apiError}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="userId" className={styles.label}>
          전화번호 뒷자리
        </label>
        <input
          id="userId"
          type="text"
          className={`${styles.input} ${errors.userId ? styles.inputError : ""}`}
          placeholder="전화번호 뒷 4자리를 입력하세요"
          value={userId}
          onChange={handleUserIdChange}
          disabled={isLoading}
          maxLength={4}
        />
        {errors.userId && (
          <span className={styles.errorMessage}>{errors.userId}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={handlePasswordChange}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && (
          <span className={styles.errorMessage}>{errors.password}</span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
};

export default LoginForm;