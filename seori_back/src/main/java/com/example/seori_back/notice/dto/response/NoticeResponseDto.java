package com.example.seori_back.notice.dto.response;

import com.example.seori_back.notice.domain.entity.Notice;

import java.time.LocalDate;

public record NoticeResponseDto(
        Long id,
        String title,
        String content,
        LocalDate createdAt,
        LocalDate updatedAt
) {
    public static NoticeResponseDto from(Notice notice) {
        return new NoticeResponseDto(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getCreatedAt().toLocalDate(),
                notice.getUpdatedAt().toLocalDate()
        );
    }
}
