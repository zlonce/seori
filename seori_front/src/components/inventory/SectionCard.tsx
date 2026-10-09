import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  addItemAPI,
  updateItemQuantityAPI,
  deleteItemAPI,
} from "../../api/inventory";
import type { InventorySection, InventoryItem } from "../../api/inventory";
import styles from "./InventoryPage.module.css";

const sortByQuantity = (items: InventoryItem[]) =>
  [...items].sort((a, b) => {
    if (a.quantity === 0 && b.quantity !== 0) return 1;
    if (a.quantity !== 0 && b.quantity === 0) return -1;
    return 0;
  });

interface Props {
  section: InventorySection;
  isEditMode: boolean;
  onSectionsChange: (updater: (prev: InventorySection[]) => InventorySection[]) => void;
  onError: (msg: string) => void;
  onPendingDelete: (fn: () => Promise<void>) => void;
  onDeleteSection: () => void;
}

export default function SectionCard({
  section,
  isEditMode,
  onSectionsChange,
  onError,
  onPendingDelete,
  onDeleteSection,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isQtyEditing, setIsQtyEditing] = useState(false);
  const [pendingQty, setPendingQty] = useState<Record<number, string>>({});
  const [addingItem, setAddingItem] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    const initial: Record<number, string> = {};
    section.items.forEach((item) => { initial[item.id] = ""; });
    setPendingQty(initial);
    setIsQtyEditing(true);
    setAddingItem(false);
  };

  const commitEdit = async () => {
    const resolvedQty = (item: InventoryItem): number => {
      const raw = pendingQty[item.id];
      if (raw === "" || raw === undefined) return item.quantity;
      const parsed = parseInt(raw);
      return isNaN(parsed) || parsed < 0 ? item.quantity : parsed;
    };

    const changed = section.items.filter((item) => resolvedQty(item) !== item.quantity);

    if (changed.length > 0) {
      try {
        await Promise.all(changed.map((item) => updateItemQuantityAPI(item.id, resolvedQty(item))));
        onSectionsChange((prev) =>
          prev.map((s) =>
            s.id === section.id
              ? { ...s, items: s.items.map((item) => ({ ...item, quantity: resolvedQty(item) })) }
              : s,
          ),
        );
      } catch {
        onError("수량 저장에 실패했습니다.");
        return;
      }
    }

    setIsQtyEditing(false);
    setPendingQty({});
    setAddingItem(false);
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemAPI(itemId);
      onSectionsChange((prev) =>
        prev.map((s) =>
          s.id === section.id
            ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
            : s,
        ),
      );
    } catch {
      onError("삭제에 실패했습니다.");
    }
  };

  const handleAddItem = async () => {
    if (!newName.trim()) return;
    const qty = parseInt(newQty);
    const quantity = isNaN(qty) || qty < 0 ? 0 : qty;
    try {
      const newItem = await addItemAPI(section.id, newName.trim(), quantity);
      onSectionsChange((prev) =>
        prev.map((s) =>
          s.id === section.id ? { ...s, items: [...s.items, newItem] } : s,
        ),
      );
      setPendingQty((prev) => ({ ...prev, [newItem.id]: "" }));
      setNewName("");
      setNewQty("1");
      setAddingItem(false);
    } catch {
      onError("추가에 실패했습니다.");
    }
  };

  const sorted = sortByQuantity(section.items);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeaderRow}>
        <button
          className={styles.sectionHeader}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? (
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
              onClick={() => (isQtyEditing ? commitEdit() : startEdit())}
            >
              {isQtyEditing ? "완료" : "수정"}
            </button>
          )}
          {isEditMode && (
            <button
              className={styles.sectionDeleteBtn}
              onClick={onDeleteSection}
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <ul className={styles.list}>
            {sorted.map((item) => {
              const pendingStr = pendingQty[item.id] ?? "";
              const displayQty =
                isQtyEditing && pendingStr !== ""
                  ? parseInt(pendingStr) || 0
                  : item.quantity;
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
                          setPendingQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const idx = sorted.findIndex((i) => i.id === item.id);
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
                              commitEdit();
                            }
                          }
                        }}
                      />
                    ) : (
                      <span className={styles.qtyText}>{displayQty}</span>
                    )}
                    {isQtyEditing && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onPendingDelete(() => handleDeleteItem(item.id))}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {isQtyEditing && (
            <>
              {addingItem ? (
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
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  />
                  <div className={styles.formBtns}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setAddingItem(false)}
                    >
                      취소
                    </button>
                    <button className={styles.saveBtn} onClick={handleAddItem}>
                      추가
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.addItemBtn}
                  onClick={() => {
                    setAddingItem(true);
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
}
