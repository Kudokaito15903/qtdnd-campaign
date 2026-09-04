package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignSummaryDto {
    private Long id;
    private String name;
    private String subject;
    private String status;
    private LocalDateTime scheduledAt;
    private LocalDateTime createdAt;
}
