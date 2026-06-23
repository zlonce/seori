package com.example.seori_back.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
        @NotBlank String userId,
        @NotBlank String password
) {}
