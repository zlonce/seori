export const validateUserId = (userId: string): boolean => {
  return /^\d{4}$/.test(userId);
};

export const validatePassword = (password: string): boolean => {
  return Boolean(password && password.length >= 4);
};

export const validateLoginForm = (
  userId: string,
  password: string,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!userId.trim()) {
    errors.userId = "전화번호 뒷자리를 입력해주세요";
  } else if (!validateUserId(userId)) {
    errors.userId = "전화번호 뒷 4자리 숫자를 입력해주세요";
  }

  if (!password) {
    errors.password = "비밀번호를 입력해주세요";
  } else if (!validatePassword(password)) {
    errors.password = "비밀번호는 최소 4자 이상이어야 합니다";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};