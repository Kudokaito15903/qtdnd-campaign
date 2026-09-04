package com.example.demo.repository;

import com.example.demo.dto.TemplateSummaryDto;
import com.example.demo.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    @Query("SELECT new com.example.demo.dto.TemplateSummaryDto(t.id, t.name, t.subject, SUBSTRING(t.htmlContent, 1, 150), t.createdAt) FROM EmailTemplate t")
    List<TemplateSummaryDto> findTemplateSummaries();
}
