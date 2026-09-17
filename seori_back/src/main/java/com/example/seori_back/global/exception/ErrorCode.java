package com.example.seori_back.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    DUPLICATE_USER_ID(HttpStatus.CONFLICT, "이미 등록된 전화번호 뒷자리입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    INVALID_CURRENT_PASSWORD(HttpStatus.UNAUTHORIZED, "현재 비밀번호가 올바르지 않습니다."),
    INVALID_PHONE_NUMBER(HttpStatus.BAD_REQUEST, "전화번호 형식이 올바르지 않습니다."),

    // Auth
    INVALID_TOKEN_TYPE(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰 타입입니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."),

    // WorkShift
    WORK_SHIFT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 근무 기록입니다."),
    FORBIDDEN_WORK_SHIFT(HttpStatus.FORBIDDEN, "본인의 근무 기록만 수정할 수 있습니다."),
    INVALID_WORK_TIME_NULL(HttpStatus.BAD_REQUEST, "시작/종료 시간은 null일 수 없습니다."),
    INVALID_WORK_TIME(HttpStatus.BAD_REQUEST, "종료 시간이 시작 시간보다 이전입니다."),

    // SpecialDay
    SPECIAL_DAY_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 특정일입니다."),
    DUPLICATE_SPECIAL_DAY(HttpStatus.CONFLICT, "이미 등록된 특정일입니다."),

    // Inventory
    INVENTORY_SECTION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 섹션입니다."),
    INVENTORY_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 재고 항목입니다."),
    INVENTORY_SECTION_NOT_EMPTY(HttpStatus.CONFLICT, "항목이 남아있는 섹션은 삭제할 수 없습니다."),

    // Memo
    MEMO_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 메모 항목입니다."),

    // Notice
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 공지사항입니다."),

    // Schedule
    SCHEDULE_WEEK_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 주차입니다."),
    SCHEDULE_INVALID_STATUS(HttpStatus.BAD_REQUEST, "현재 상태에서 허용되지 않는 작업입니다."),
    SCHEDULE_ALREADY_CONFIRMED(HttpStatus.BAD_REQUEST, "확정된 일정의 영업일은 수정할 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}
