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
import styles from "./InventoryPage.module.css";

const sortByQuantity = (items: InventoryItem[]) =>
  [...items].sort((a, b) => {
    if (a.quantity === 0 && b.quantity !== 0) return 1;
    if (a.quantity !== 0 && b.quantity === 0) return -1;
    return 0;
  });

export default function InventoryPage() {
  const [sections, setSections] = useState<InventorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState("");
  const [addingSection, setAddingSection] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
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

  const startEditQty = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingQty("");
  };

  const commitQty = async (sectionId: number, itemId: number, oldQty: number) => {
    const qty = editingQty === "" ? oldQty : parseInt(editingQty);
    setEditingId(null);
    if (!isNaN(qty) && qty >= 0 && qty !== oldQty) {
      try {
        const updated = await updateItemQuantityAPI(itemId, qty);
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  items: s.items.map((item) =>
                    item.id === itemId ? { ...item, ...updated } : item,
                  ),
                }
              : s,
          ),
        );
      } catch {
        showError("수량 저장에 실패했습니다.");
      }
    }
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
    setAddingSection(null);
    setEditingId(null);
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
        <button
          className={`${styles.editBtn} ${isEditMode ? styles.editBtnActive : ""}`}
          onClick={handleToggleEditMode}
        >
          {isEditMode ? "완료" : "수정"}
        </button>
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
              {isEditMode && (
                <button
                  className={styles.sectionDeleteBtn}
                  onClick={() => handleDeleteSection(section.id)}
                >
                  삭제
                </button>
              )}
            </div>

            {!isCollapsed && (
              <>
                <ul className={styles.list}>
                  {sorted.map((item) => (
                    <li
                      key={item.id}
                      className={`${styles.item} ${item.quantity === 0 ? styles.itemEmpty : ""}`}
                    >
                      <span className={styles.itemName}>{item.name}</span>
                      <div className={styles.itemRight}>
                        {editingId === item.id ? (
                          <input
                            className={styles.qtyEditInput}
                            type="number"
                            min="0"
                            placeholder={String(item.quantity)}
                            value={editingQty}
                            onChange={(e) => setEditingQty(e.target.value)}
                            onBlur={() =>
                              commitQty(section.id, item.id, item.quantity)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                commitQty(section.id, item.id, item.quantity);
                                const idx = sorted.findIndex((i) => i.id === item.id);
                                const next = sorted[idx + 1];
                                if (next) {
                                  setEditingId(next.id);
                                  setEditingQty("");
                                }
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            className={styles.qtyBtn}
                            onClick={() => startEditQty(item)}
                          >
                            {item.quantity}
                          </button>
                        )}
                        {isEditMode && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(section.id, item.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {isEditMode && (
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
