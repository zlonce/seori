import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import LoginForm from "./LoginForm";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/schedule");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSuccess = (_user: User) => {
    navigate("/schedule");
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;