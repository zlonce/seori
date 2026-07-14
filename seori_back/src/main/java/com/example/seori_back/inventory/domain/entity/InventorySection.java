package com.example.seori_back.inventory.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_sections")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InventorySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String label;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryItem> items = new ArrayList<>();

    public static InventorySection create(String label) {
        InventorySection section = new InventorySection();
        section.label = label;
        return section;
    }
}
