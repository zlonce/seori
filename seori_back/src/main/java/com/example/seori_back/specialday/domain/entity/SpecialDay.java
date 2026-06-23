package com.example.seori_back.specialday.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "special_days")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpecialDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false)
    private boolean recurring;

    public static SpecialDay create(LocalDate date, String name, boolean recurring) {
        SpecialDay specialDay = new SpecialDay();
        specialDay.date = date;
        specialDay.name = name;
        specialDay.recurring = recurring;
        return specialDay;
    }
}
