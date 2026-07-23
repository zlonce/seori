package com.example.seori_back.memo.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "memo_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MemoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String text;

    @Column(nullable = false)
    private boolean done;

    public static MemoItem create(String text) {
        MemoItem item = new MemoItem();
        item.text = text;
        item.done = false;
        return item;
    }

    public void toggleDone() {
        this.done = !this.done;
    }
}
