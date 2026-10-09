package com.example.seori_back.inventory.dto.response;

import com.example.seori_back.inventory.domain.entity.InventoryItem;

public record InventoryItemResponseDto(
        Long id,
        String name,
        int quantity
) {
    public static InventoryItemResponseDto from(InventoryItem item) {
        return new InventoryItemResponseDto(item.getId(), item.getName(), item.getQuantity());
    }
}
