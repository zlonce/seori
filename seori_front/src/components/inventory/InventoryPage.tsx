import { useEffect, useState } from "react";
import ConfirmModal from "../common/ConfirmModal";
import SectionCard from "./SectionCard";
import {
  getSectionsAPI,
  createSectionAPI,
  deleteSectionAPI,
} from "../../api/inventory";
import type { InventorySection } from "../../api/inventory";
import { useAuth } from "../../hooks/useAuth";
import styles from "./InventoryPage.module.css";

export default function InventoryPage() {
  const { user } = useAuth();
  const isManagerOrAbove =
    user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";

  const [sections, setSections] = useState<InventorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    getSectionsAPI()
      .then(setSections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleCreateSection = async () => {
    if (!newSectionLabel.trim()) return;
    try {
      const created = await createSectionAPI(newSectionLabel.trim());
      setSections((prev) => [...prev, created]);
      setNewSectionLabel("");
      setIsAddingSection(false);
    } catch {
      showError("섹션 추가에 실패했습니다.");
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      await deleteSectionAPI(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setPendingDelete(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "섹션 삭제에 실패했습니다.";
      showError(message);
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode((v) => !v);
    setIsAddingSection(false);
    setNewSectionLabel("");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>재고</h2>
        </div>
        <p className={styles.empty}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>재고</h2>
        {isManagerOrAbove && (
          <button
            className={`${styles.editBtn} ${isEditMode ? styles.editBtnActive : ""}`}
            onClick={handleToggleEditMode}
          >
            {isEditMode ? "완료" : "편집"}
          </button>
        )}
      </div>

      {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

      {sections.length === 0 && !isEditMode && (
        <p className={styles.empty}>등록된 재고 섹션이 없습니다.</p>
      )}

      {isEditMode && (
        <div className={styles.addSectionWrap}>
          {isAddingSection ? (
            <div className={styles.addSectionForm}>
              <input
                className={styles.nameInput}
                placeholder="섹션명 (예: 음료, 식자재)"
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSection()}
                autoFocus
              />
              <div className={styles.formBtns}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => { setIsAddingSection(false); setNewSectionLabel(""); }}
                >
                  취소
                </button>
                <button className={styles.saveBtn} onClick={handleCreateSection}>
                  추가
                </button>
              </div>
            </div>
          ) : (
            <button
              className={styles.addSectionBtn}
              onClick={() => setIsAddingSection(true)}
            >
              + 섹션 추가
            </button>
          )}
        </div>
      )}

      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          isEditMode={isEditMode}
          onSectionsChange={setSections}
          onError={showError}
          onPendingDelete={(fn) => setPendingDelete(() => fn)}
          onDeleteSection={() =>
            setPendingDelete(() => () => handleDeleteSection(section.id))
          }
        />
      ))}

      {pendingDelete !== null && (
        <ConfirmModal
          onConfirm={() => pendingDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
