package com.example.seori_back.memo.dto.response;

import com.example.seori_back.memo.domain.entity.MemoItem;

public record MemoItemResponseDto(
        Long id,
        String text,
        boolean done
) {
    public static MemoItemResponseDto from(MemoItem item) {
        return new MemoItemResponseDto(item.getId(), item.getText(), item.isDone());
    }
}
