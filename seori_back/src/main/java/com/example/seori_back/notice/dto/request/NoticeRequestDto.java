package com.example.seori_back.notice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeRequestDto(
        @NotBlank
        @Size(max = 200)
        String title,

        @NotBlank
        String content
) {}
