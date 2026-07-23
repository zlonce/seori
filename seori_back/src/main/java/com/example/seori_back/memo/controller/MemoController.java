package com.example.seori_back.memo.controller;

import com.example.seori_back.memo.dto.request.CreateMemoItemRequestDto;
import com.example.seori_back.memo.dto.response.MemoItemResponseDto;
import com.example.seori_back.memo.service.MemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memo")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @GetMapping
    public ResponseEntity<List<MemoItemResponseDto>> getMemos() {
        return ResponseEntity.ok(memoService.getMemos());
    }

    @PostMapping
    public ResponseEntity<MemoItemResponseDto> createMemo(
            @RequestBody @Valid CreateMemoItemRequestDto request) {
        return ResponseEntity.ok(memoService.createMemo(request));
    }

    @PatchMapping("/{id}/done")
    public ResponseEntity<MemoItemResponseDto> toggleDone(@PathVariable Long id) {
        return ResponseEntity.ok(memoService.toggleDone(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemo(@PathVariable Long id) {
        memoService.deleteMemo(id);
        return ResponseEntity.noContent().build();
    }
}
