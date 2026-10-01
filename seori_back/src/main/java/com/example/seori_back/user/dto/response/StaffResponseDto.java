package com.example.seori_back.user.dto.response;

import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.domain.entity.UserRoleEnum;

public record StaffResponseDto(
        String userId,
        String name,
        String phone,
        UserRoleEnum role,
        int hourlyWage,
        int overtimeWage,
        boolean active
) {
    public static StaffResponseDto from(User user) {
        return new StaffResponseDto(
                user.getUserId(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getHourlyWage(),
                user.getOvertimeWage(),
                user.isActive()
        );
    }
}
