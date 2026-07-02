package com.example.seori_back.user.dto.response;

import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.domain.entity.UserRoleEnum;

public record StaffSummaryResponseDto(
        String userId,
        String name,
        String phone,
        UserRoleEnum role,
        int hourlyWage,
        int overtimeWage,
        int weeklyWorkDays
) {
    public static StaffSummaryResponseDto from(User user) {
        return new StaffSummaryResponseDto(
                user.getUserId(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getHourlyWage(),
                user.getOvertimeWage(),
                user.getWeeklyWorkDays()
        );
    }
}
