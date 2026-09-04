package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateSummaryDto {
    private Long id;
    private String name;
    private String subject;
    private String previewHtml;
    private LocalDateTime createdAt;
}
