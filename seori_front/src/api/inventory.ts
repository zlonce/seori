import client from "./client";

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

export interface InventorySection {
  id: number;
  label: string;
  items: InventoryItem[];
}

export const getSectionsAPI = () =>
  client.get<InventorySection[]>("/inventory/sections").then((r) => r.data);

export const addItemAPI = (sectionId: number, name: string, quantity: number) =>
  client
    .post<InventoryItem>(`/inventory/sections/${sectionId}/items`, { name, quantity })
    .then((r) => r.data);

export const updateItemQuantityAPI = (itemId: number, quantity: number) =>
  client
    .patch<InventoryItem>(`/inventory/items/${itemId}/quantity`, { quantity })
    .then((r) => r.data);

export const deleteItemAPI = (itemId: number) =>
  client.delete(`/inventory/items/${itemId}`);

export const createSectionAPI = (label: string) =>
  client
    .post<InventorySection>("/inventory/sections", { label })
    .then((r) => r.data);

export const deleteSectionAPI = (sectionId: number) =>
  client.delete(`/inventory/sections/${sectionId}`);
