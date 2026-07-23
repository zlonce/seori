package com.example.seori_back.notice.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.notice.domain.entity.Notice;
import com.example.seori_back.notice.dto.request.NoticeRequestDto;
import com.example.seori_back.notice.dto.response.NoticeResponseDto;
import com.example.seori_back.notice.dto.response.NoticeSummaryResponseDto;
import com.example.seori_back.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional(readOnly = true)
    public List<NoticeSummaryResponseDto> getNotices() {
        return noticeRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(NoticeSummaryResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoticeResponseDto getNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));
        return NoticeResponseDto.from(notice);
    }

    @Transactional
    public NoticeResponseDto createNotice(NoticeRequestDto request) {
        Notice notice = Notice.create(request.title(), request.content());
        noticeRepository.save(notice);
        return NoticeResponseDto.from(notice);
    }

    @Transactional
    public NoticeResponseDto updateNotice(Long id, NoticeRequestDto request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));
        notice.update(request.title(), request.content());
        return NoticeResponseDto.from(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));
        noticeRepository.delete(notice);
    }
}
