package com.example.seori_back.user.dto.response;

public record LoginResponseDto(
        String accessToken,
        String refreshToken
) {}
