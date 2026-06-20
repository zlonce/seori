package com.example.seori_back.user.dto.request;

import com.example.seori_back.user.domain.entity.UserRoleEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

@Getter
public class CreateUserRequestDto {

    @NotBlank
    private String phone;

    @NotNull
    private UserRoleEnum role;

    @Positive
    private int hourlyWage;

    @Positive
    private int overtimeWage;
}
