package com.example.seori_back.user.dto.request;

import com.example.seori_back.user.domain.entity.UserRoleEnum;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateStaffRequestDto(
        @NotBlank String name,
        @NotNull UserRoleEnum role,
        @Positive int hourlyWage,
        @Positive int overtimeWage
) {
    @AssertTrue(message = "역할은 STAFF 또는 MANAGER만 설정할 수 있습니다.")
    public boolean isRoleValid() {
        return role == UserRoleEnum.STAFF || role == UserRoleEnum.MANAGER;
    }
}
