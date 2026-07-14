import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  getSectionsAPI,
  addItemAPI,
  updateItemQuantityAPI,
  deleteItemAPI,
  createSectionAPI,
  deleteSectionAPI,
} from "../../api/inventory";
import type { InventorySection, InventoryItem } from "../../api/inventory";
import { useAuth } from "../../hooks/useAuth";
import styles from "./InventoryPage.module.css";

const sortByQuantity = (items: InventoryItem[]) =>
  [...items].sort((a, b) => {
    if (a.quantity === 0 && b.quantity !== 0) return 1;
    if (a.quantity !== 0 && b.quantity === 0) return -1;
    return 0;
  });

export default function InventoryPage() {
  const { user } = useAuth();
  const isManagerOrAbove =
    user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";

  const [sections, setSections] = useState<InventorySection[]>([]);
  const [loading, setLoading] = useState(true);

  // owner/manager 전용: 섹션 추가·삭제 모드
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  // 섹션별 수정 모드: 수량 수정 + 아이템 추가·삭제
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [pendingQty, setPendingQty] = useState<Record<number, string>>({});
  const [addingSection, setAddingSection] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

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

  const toggleCollapse = (id: number) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const startSectionEdit = (section: InventorySection) => {
    const initial: Record<number, string> = {};
    section.items.forEach((item) => {
      initial[item.id] = "";
    });
    setPendingQty(initial);
    setEditingSectionId(section.id);
    setAddingSection(null);
    setConfirmDeleteId(null);
  };

  const commitSectionEdit = async (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const resolvedQty = (item: InventoryItem): number => {
      const raw = pendingQty[item.id];
      if (raw === "" || raw === undefined) return item.quantity;
      const parsed = parseInt(raw);
      return isNaN(parsed) || parsed < 0 ? item.quantity : parsed;
    };

    const changed = section.items.filter(
      (item) => resolvedQty(item) !== item.quantity,
    );

    if (changed.length > 0) {
      try {
        await Promise.all(
          changed.map((item) =>
            updateItemQuantityAPI(item.id, resolvedQty(item)),
          ),
        );
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  items: s.items.map((item) => ({
                    ...item,
                    quantity: resolvedQty(item),
                  })),
                }
              : s,
          ),
        );
      } catch {
        showError("수량 저장에 실패했습니다.");
        return;
      }
    }

    setEditingSectionId(null);
    setPendingQty({});
    setAddingSection(null);
    setConfirmDeleteId(null);
  };

  const handleDelete = async (sectionId: number, itemId: number) => {
    try {
      await deleteItemAPI(itemId);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
            : s,
        ),
      );
      setConfirmDeleteId(null);
    } catch {
      showError("삭제에 실패했습니다.");
    }
  };

  const handleAdd = async (sectionId: number) => {
    if (!newName.trim()) return;
    const qty = parseInt(newQty);
    const quantity = isNaN(qty) || qty < 0 ? 0 : qty;
    try {
      const newItem = await addItemAPI(sectionId, newName.trim(), quantity);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s,
        ),
      );
      // 추가한 아이템을 pendingQty에도 등록
      setPendingQty((prev) => ({ ...prev, [newItem.id]: "" }));
      setNewName("");
      setNewQty("1");
      setAddingSection(null);
    } catch {
      showError("추가에 실패했습니다.");
    }
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
    } catch {
      showError("섹션 삭제에 실패했습니다.");
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode((v) => !v);
    setIsAddingSection(false);
    setNewSectionLabel("");
    setEditingSectionId(null);
    setPendingQty({});
    setAddingSection(null);
    setConfirmDeleteId(null);
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
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSectionLabel("");
                  }}
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

      {sections.map((section) => {
        const isCollapsed = !!collapsed[section.id];
        const isQtyEditing = editingSectionId === section.id;
        const sorted = sortByQuantity(section.items);

        return (
          <div key={section.id} className={styles.section}>
            <div className={styles.sectionHeaderRow}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleCollapse(section.id)}
              >
                {isCollapsed ? (
                  <ChevronRight size={16} color="#888" />
                ) : (
                  <ChevronDown size={16} color="#888" />
                )}
                <span className={styles.sectionLabel}>{section.label}</span>
              </button>
              <div className={styles.sectionHeaderActions}>
                {!isEditMode && (
                  <button
                    className={`${styles.sectionQtyEditBtn} ${isQtyEditing ? styles.sectionQtyEditBtnActive : ""}`}
                    onClick={() =>
                      isQtyEditing
                        ? commitSectionEdit(section.id)
                        : startSectionEdit(section)
                    }
                  >
                    {isQtyEditing ? "완료" : "수정"}
                  </button>
                )}
                {isEditMode && (
                  <button
                    className={styles.sectionDeleteBtn}
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <>
                <ul className={styles.list}>
                  {sorted.map((item) => {
                    const pendingStr = pendingQty[item.id] ?? "";
                    const displayQty =
                      isQtyEditing && pendingStr !== ""
                        ? parseInt(pendingStr) || 0
                        : item.quantity;
                    const isConfirming = confirmDeleteId === item.id;

                    return (
                      <li
                        key={item.id}
                        className={`${styles.item} ${displayQty === 0 ? styles.itemEmpty : ""}`}
                      >
                        <span className={styles.itemName}>{item.name}</span>
                        <div className={styles.itemRight}>
                          {isQtyEditing ? (
                            <input
                              className={styles.qtyEditInput}
                              type="number"
                              min="0"
                              placeholder={String(item.quantity)}
                              value={pendingStr}
                              onChange={(e) =>
                                setPendingQty((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const idx = sorted.findIndex(
                                    (i) => i.id === item.id,
                                  );
                                  const next = sorted[idx + 1];
                                  if (next) {
                                    (
                                      e.currentTarget
                                        .closest("li")
                                        ?.nextElementSibling?.querySelector(
                                          "input[type='number']",
                                        ) as HTMLInputElement | null
                                    )?.focus();
                                  } else {
                                    commitSectionEdit(section.id);
                                  }
                                }
                              }}
                            />
                          ) : (
                            <span className={styles.qtyText}>{displayQty}</span>
                          )}
                          {isQtyEditing && (
                            isConfirming ? (
                              <div className={styles.deleteConfirm}>
                                <span className={styles.deleteConfirmText}>삭제할까요?</span>
                                <button
                                  className={styles.deleteCancelBtn}
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  취소
                                </button>
                                <button
                                  className={styles.deleteConfirmBtn}
                                  onClick={() => handleDelete(section.id, item.id)}
                                >
                                  삭제
                                </button>
                              </div>
                            ) : (
                              <button
                                className={styles.deleteBtn}
                                onClick={() => setConfirmDeleteId(item.id)}
                              >
                                삭제
                              </button>
                            )
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {isQtyEditing && (
                  <>
                    {addingSection === section.id ? (
                      <div className={styles.addForm}>
                        <input
                          className={styles.nameInput}
                          placeholder="품목명"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") qtyInputRef.current?.focus();
                          }}
                          autoFocus
                        />
                        <input
                          ref={qtyInputRef}
                          className={styles.qtyInput}
                          type="number"
                          min="0"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAdd(section.id)
                          }
                        />
                        <div className={styles.formBtns}>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => setAddingSection(null)}
                          >
                            취소
                          </button>
                          <button
                            className={styles.saveBtn}
                            onClick={() => handleAdd(section.id)}
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={styles.addItemBtn}
                        onClick={() => {
                          setAddingSection(section.id);
                          setNewName("");
                          setNewQty("1");
                        }}
                      >
                        + 추가
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
