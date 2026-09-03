package com.example.demo.repository;

import com.example.demo.entity.CampaignRecipient;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {

    List<CampaignRecipient> findByCampaignIdAndStatus(Long campaignId, String status, Pageable pageable);

    long countByCampaignIdAndStatus(Long campaignId, String status);

    @org.springframework.transaction.annotation.Transactional
    void deleteByCampaignId(Long campaignId);
}
