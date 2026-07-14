package com.example.seori_back.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSectionRequestDto(
        @NotBlank
        @Size(max = 50)
        String label
) {}
