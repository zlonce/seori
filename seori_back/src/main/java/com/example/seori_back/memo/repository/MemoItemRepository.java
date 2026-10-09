package com.example.seori_back.memo.repository;

import com.example.seori_back.memo.domain.entity.MemoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemoItemRepository extends JpaRepository<MemoItem, Long> {
    List<MemoItem> findAllByOrderByIdDesc();
}
