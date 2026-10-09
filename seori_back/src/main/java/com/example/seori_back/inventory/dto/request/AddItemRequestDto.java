package com.example.seori_back.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddItemRequestDto(
        @NotBlank
        @Size(max = 100)
        String name,

        @Min(0)
        int quantity
) {}
