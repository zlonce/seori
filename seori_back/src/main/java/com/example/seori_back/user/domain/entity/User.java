package com.example.seori_back.user.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 15, unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoleEnum role;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(nullable = false)
    private int hourlyWage;

    @Column(nullable = false)
    private int overtimeWage;

    @Column(nullable = false)
    private int weeklyWorkDays;

    public static User create(String userId, String encodedPassword, String phone, String name, UserRoleEnum role, int hourlyWage, int overtimeWage, int weeklyWorkDays) {
        User user = new User();
        user.userId = userId;
        user.password = encodedPassword;
        user.phone = phone;
        user.name = name;
        user.role = role;
        user.hourlyWage = hourlyWage;
        user.overtimeWage = overtimeWage;
        user.weeklyWorkDays = weeklyWorkDays;
        return user;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void updateProfile(String name, UserRoleEnum role, int hourlyWage, int overtimeWage, int weeklyWorkDays) {
        this.name = name;
        this.role = role;
        this.hourlyWage = hourlyWage;
        this.overtimeWage = overtimeWage;
        this.weeklyWorkDays = weeklyWorkDays;
    }
}
