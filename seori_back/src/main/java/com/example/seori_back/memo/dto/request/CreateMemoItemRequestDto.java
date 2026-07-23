package com.example.seori_back.memo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMemoItemRequestDto(
        @NotBlank
        @Size(max = 50)
        String text
) {}
