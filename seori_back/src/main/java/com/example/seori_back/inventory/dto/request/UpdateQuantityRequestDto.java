package com.example.seori_back.inventory.dto.request;

import jakarta.validation.constraints.Min;

public record UpdateQuantityRequestDto(
        @Min(0)
        int quantity
) {}
