package com.example.seori_back.user.dto.response;

import com.example.seori_back.user.domain.entity.User;

public record StaffSummaryResponseDto(
        String userId,
        String name
) {
    public static StaffSummaryResponseDto from(User user) {
        return new StaffSummaryResponseDto(
                user.getUserId(),
                user.getName()
        );
    }
}
