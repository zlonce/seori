package com.example.seori_back.inventory.controller;

import com.example.seori_back.inventory.dto.request.AddItemRequestDto;
import com.example.seori_back.inventory.dto.request.CreateSectionRequestDto;
import com.example.seori_back.inventory.dto.request.UpdateQuantityRequestDto;
import com.example.seori_back.inventory.dto.response.InventoryItemResponseDto;
import com.example.seori_back.inventory.dto.response.InventorySectionResponseDto;
import com.example.seori_back.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/sections")
    public ResponseEntity<List<InventorySectionResponseDto>> getSections() {
        return ResponseEntity.ok(inventoryService.getSections());
    }

    @PostMapping("/sections")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<InventorySectionResponseDto> createSection(
            @RequestBody @Valid CreateSectionRequestDto request) {
        return ResponseEntity.ok(inventoryService.createSection(request));
    }

    @DeleteMapping("/sections/{sectionId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long sectionId) {
        inventoryService.deleteSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{sectionId}/items")
    public ResponseEntity<InventoryItemResponseDto> addItem(
            @PathVariable Long sectionId,
            @RequestBody @Valid AddItemRequestDto request) {
        return ResponseEntity.ok(inventoryService.addItem(sectionId, request));
    }

    @PatchMapping("/items/{itemId}/quantity")
    public ResponseEntity<InventoryItemResponseDto> updateQuantity(
            @PathVariable Long itemId,
            @RequestBody @Valid UpdateQuantityRequestDto request) {
        return ResponseEntity.ok(inventoryService.updateQuantity(itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        inventoryService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
