package com.example.seori_back.inventory.repository;

import com.example.seori_back.inventory.domain.entity.InventorySection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventorySectionRepository extends JpaRepository<InventorySection, Long> {

    @Query("SELECT DISTINCT s FROM InventorySection s LEFT JOIN FETCH s.items")
    List<InventorySection> findAllWithItems();
}
