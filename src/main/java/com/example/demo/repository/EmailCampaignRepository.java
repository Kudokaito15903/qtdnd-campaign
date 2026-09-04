package com.example.demo.repository;

import com.example.demo.dto.CampaignSummaryDto;
import com.example.demo.entity.EmailCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, Long> {

    @Query("SELECT e FROM EmailCampaign e WHERE e.status = :status AND (e.scheduledAt IS NULL OR e.scheduledAt <= :currentTime)")
    List<EmailCampaign> findByStatusAndScheduledAtBeforeOrNull(String status, LocalDateTime currentTime);

    @Query("SELECT new com.example.demo.dto.CampaignSummaryDto(e.id, e.name, e.subject, e.status, e.scheduledAt, e.createdAt) FROM EmailCampaign e")
    List<CampaignSummaryDto> findCampaignSummaries();
}
