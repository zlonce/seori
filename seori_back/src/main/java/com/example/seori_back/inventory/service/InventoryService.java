package com.example.seori_back.inventory.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.inventory.domain.entity.InventoryItem;
import com.example.seori_back.inventory.domain.entity.InventorySection;
import com.example.seori_back.inventory.dto.request.AddItemRequestDto;
import com.example.seori_back.inventory.dto.request.CreateSectionRequestDto;
import com.example.seori_back.inventory.dto.request.UpdateQuantityRequestDto;
import com.example.seori_back.inventory.dto.response.InventoryItemResponseDto;
import com.example.seori_back.inventory.dto.response.InventorySectionResponseDto;
import com.example.seori_back.inventory.repository.InventoryItemRepository;
import com.example.seori_back.inventory.repository.InventorySectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventorySectionRepository sectionRepository;
    private final InventoryItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<InventorySectionResponseDto> getSections() {
        return sectionRepository.findAllWithItems().stream()
                .map(InventorySectionResponseDto::from)
                .toList();
    }

    @Transactional
    public InventorySectionResponseDto createSection(CreateSectionRequestDto request) {
        InventorySection section = InventorySection.create(request.label());
        sectionRepository.save(section);
        return InventorySectionResponseDto.from(section);
    }

    @Transactional
    public void deleteSection(Long sectionId) {
        InventorySection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_SECTION_NOT_FOUND));
        if (!section.getItems().isEmpty()) {
            throw new CustomException(ErrorCode.INVENTORY_SECTION_NOT_EMPTY);
        }
        sectionRepository.delete(section);
    }

    @Transactional
    public InventoryItemResponseDto addItem(Long sectionId, AddItemRequestDto request) {
        InventorySection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_SECTION_NOT_FOUND));
        InventoryItem item = InventoryItem.create(section, request.name(), request.quantity());
        itemRepository.save(item);
        return InventoryItemResponseDto.from(item);
    }

    @Transactional
    public InventoryItemResponseDto updateQuantity(Long itemId, UpdateQuantityRequestDto request) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_ITEM_NOT_FOUND));
        item.updateQuantity(request.quantity());
        return InventoryItemResponseDto.from(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_ITEM_NOT_FOUND));
        itemRepository.delete(item);
    }
}
