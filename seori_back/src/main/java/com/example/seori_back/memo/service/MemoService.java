package com.example.seori_back.memo.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.memo.domain.entity.MemoItem;
import com.example.seori_back.memo.dto.request.CreateMemoItemRequestDto;
import com.example.seori_back.memo.dto.response.MemoItemResponseDto;
import com.example.seori_back.memo.repository.MemoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoService {

    private final MemoItemRepository memoItemRepository;

    @Transactional(readOnly = true)
    public List<MemoItemResponseDto> getMemos() {
        return memoItemRepository.findAllByOrderByIdDesc().stream()
                .map(MemoItemResponseDto::from)
                .toList();
    }

    @Transactional
    public MemoItemResponseDto createMemo(CreateMemoItemRequestDto request) {
        MemoItem item = MemoItem.create(request.text());
        memoItemRepository.save(item);
        return MemoItemResponseDto.from(item);
    }

    @Transactional
    public MemoItemResponseDto toggleDone(Long id) {
        MemoItem item = memoItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMO_ITEM_NOT_FOUND));
        item.toggleDone();
        return MemoItemResponseDto.from(item);
    }

    @Transactional
    public void deleteMemo(Long id) {
        MemoItem item = memoItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMO_ITEM_NOT_FOUND));
        memoItemRepository.delete(item);
    }
}
