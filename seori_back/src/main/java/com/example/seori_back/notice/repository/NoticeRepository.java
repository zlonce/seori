package com.example.seori_back.notice.repository;

import com.example.seori_back.notice.domain.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findAllByOrderByUpdatedAtDesc();
}
