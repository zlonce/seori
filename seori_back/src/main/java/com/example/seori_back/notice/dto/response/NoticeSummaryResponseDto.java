package com.example.seori_back.notice.dto.response;

import com.example.seori_back.notice.domain.entity.Notice;

import java.time.LocalDate;

public record NoticeSummaryResponseDto(
        Long id,
        String title,
        LocalDate updatedAt
) {
    public static NoticeSummaryResponseDto from(Notice notice) {
        return new NoticeSummaryResponseDto(
                notice.getId(),
                notice.getTitle(),
                notice.getUpdatedAt().toLocalDate()
        );
    }
}
