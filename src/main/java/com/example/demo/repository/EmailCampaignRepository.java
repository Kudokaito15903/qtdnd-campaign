package com.example.demo.repository;

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
}
