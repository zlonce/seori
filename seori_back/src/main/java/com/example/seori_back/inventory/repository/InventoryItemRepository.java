package com.example.seori_back.inventory.repository;

import com.example.seori_back.inventory.domain.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
}
