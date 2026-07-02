import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./InventoryPage.module.css";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

interface InventorySection {
  id: string;
  label: string;
  items: InventoryItem[];
}

// TODO: API 연결 시 제거
const DUMMY_DATA: InventorySection[] = [
  {
    id: "fridge",
    label: "냉장고",
    items: [
      { id: 1, name: "무말랭이", quantity: 2 },
      { id: 2, name: "막국수 소스", quantity: 2 },
      { id: 3, name: "마늘소스", quantity: 2 },
      { id: 4, name: "불족 소스", quantity: 4 },
      { id: 5, name: "떡볶이 소스", quantity: 3 },
      { id: 6, name: "냉채 소스", quantity: 3 },
    ],
  },
  {
    id: "box",
    label: "박스",
    items: [],
  },
];

const sortByQuantity = (items: InventoryItem[]) =>
  [...items].sort((a, b) => {
    if (a.quantity === 0 && b.quantity !== 0) return 1;
    if (a.quantity !== 0 && b.quantity === 0) return -1;
    return 0;
  });

export default function InventoryPage() {
  const [sections, setSections] = useState<InventorySection[]>(DUMMY_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState("");
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const startEditQty = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingQty("");
  };

  const commitQty = (sectionId: string, itemId: number, oldQty: number) => {
    const qty = editingQty === "" ? oldQty : parseInt(editingQty);
    if (!isNaN(qty) && qty >= 0) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map((item) =>
                  item.id === itemId ? { ...item, quantity: qty } : item,
                ),
              }
            : s,
        ),
      );
    }
    setEditingId(null);
  };

  const handleDelete = (sectionId: string, itemId: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
          : s,
      ),
    );
  };

  const handleAdd = (sectionId: string) => {
    if (!newName.trim()) return;
    const qty = parseInt(newQty);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [
                ...s.items,
                {
                  id: Date.now(),
                  name: newName.trim(),
                  quantity: isNaN(qty) ? 0 : qty,
                },
              ],
            }
          : s,
      ),
    );
    setNewName("");
    setNewQty("1");
    setAddingSection(null);
  };

  const handleToggleEditMode = () => {
    setIsEditMode((v) => !v);
    setAddingSection(null);
    setEditingId(null);
  };

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

      {sections.map((section) => {
        const isCollapsed = !!collapsed[section.id];
        const sorted = sortByQuantity(section.items);

        return (
          <div key={section.id} className={styles.section}>
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
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              commitQty(section.id, item.id, item.quantity)
                            }
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
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAdd(section.id)
                          }
                          autoFocus
                        />
                        <input
                          className={styles.qtyInput}
                          type="number"
                          min="0"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
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
