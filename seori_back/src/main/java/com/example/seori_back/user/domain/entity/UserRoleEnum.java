package com.example.seori_back.user.domain.entity;

public enum UserRoleEnum {
    OWNER(Authority.OWNER),
    MANAGER(Authority.MANAGER),
    STAFF(Authority.STAFF);

    private final String authority;

    UserRoleEnum(String authority) {
        this.authority = authority;
    }

    public String getAuthority() {
        return this.authority;
    }

    public static class Authority {
        public static final String OWNER = "ROLE_OWNER";
        public static final String MANAGER = "ROLE_MANAGER";
        public static final String STAFF = "ROLE_STAFF";
    }
}
