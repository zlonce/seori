package com.example.seori_back.inventory.dto.response;

import com.example.seori_back.inventory.domain.entity.InventorySection;

import java.util.List;

public record InventorySectionResponseDto(
        Long id,
        String label,
        List<InventoryItemResponseDto> items
) {
    public static InventorySectionResponseDto from(InventorySection section) {
        List<InventoryItemResponseDto> items = section.getItems().stream()
                .map(InventoryItemResponseDto::from)
                .toList();
        return new InventorySectionResponseDto(section.getId(), section.getLabel(), items);
    }
}
