package com.example.seori_back.specialday.controller;

import com.example.seori_back.specialday.dto.request.CreateSpecialDayRequestDto;
import com.example.seori_back.specialday.dto.response.SpecialDayResponseDto;
import com.example.seori_back.specialday.service.SpecialDayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/special-days")
@RequiredArgsConstructor
public class SpecialDayController {

    private final SpecialDayService specialDayService;

    @GetMapping
    public ResponseEntity<List<SpecialDayResponseDto>> getByYearMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(specialDayService.getByYearMonth(year, month));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SpecialDayResponseDto>> getActive(@RequestParam int year) {
        return ResponseEntity.ok(specialDayService.getActive(year));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<SpecialDayResponseDto> create(@RequestBody @Valid CreateSpecialDayRequestDto request) {
        return ResponseEntity.ok(specialDayService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        specialDayService.delete(id);
        return ResponseEntity.ok().build();
    }
}
