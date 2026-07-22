package com.example.seori_back.inventory.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private InventorySection section;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int quantity;

    public static InventoryItem create(InventorySection section, String name, int quantity) {
        InventoryItem item = new InventoryItem();
        item.section = section;
        item.name = name;
        item.quantity = quantity;
        return item;
    }

    public void updateQuantity(int quantity) {
        this.quantity = quantity;
    }
}
