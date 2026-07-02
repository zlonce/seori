package com.example.seori_back.user.dto.request;

import com.example.seori_back.user.domain.entity.UserRoleEnum;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateUserRequestDto(
        @NotBlank String phone,
        @NotBlank String name,
        @NotNull UserRoleEnum role,
        @Positive int hourlyWage,
        @Positive int overtimeWage,
        @Min(1) @Max(5) int weeklyWorkDays
) {}
