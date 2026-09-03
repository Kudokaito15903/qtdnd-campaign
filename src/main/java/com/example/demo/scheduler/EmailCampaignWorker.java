package com.example.demo.scheduler;

import com.example.demo.entity.CampaignRecipient;
import com.example.demo.entity.Customer;
import com.example.demo.entity.EmailCampaign;
import com.example.demo.repository.CampaignRecipientRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.EmailCampaignRepository;
import com.example.demo.service.EmailCampaignService;
import com.example.demo.service.EmailSenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailCampaignWorker {

    private final EmailCampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final CustomerRepository customerRepository;
    private final EmailSenderService emailSenderService;
    private final EmailCampaignService emailCampaignService; // Injected to correctly prepare campaigns

    // Run every 5 seconds
    @Scheduled(fixedDelay = 5000)
    public void processEmailCampaigns() {
        // 1. Process scheduled campaigns that need to be prepared
        prepareScheduledCampaigns();

        // 2. Process active campaigns that are PROCESSING
        List<EmailCampaign> processingCampaigns = campaignRepository.findByStatusAndScheduledAtBeforeOrNull("PROCESSING", LocalDateTime.now());

        for (EmailCampaign campaign : processingCampaigns) {
            processBatchForCampaign(campaign);
        }
    }

    @Transactional
    public void prepareScheduledCampaigns() {
        List<EmailCampaign> scheduledCampaigns = campaignRepository.findByStatusAndScheduledAtBeforeOrNull("SCHEDULED", LocalDateTime.now());
        for (EmailCampaign campaign : scheduledCampaigns) {
            log.info("Triggering scheduled campaign {}", campaign.getId());
            // This service method generates PENDING recipients and changes status to PROCESSING
            emailCampaignService.prepareCampaign(campaign.getId());
        }
    }

    private void processBatchForCampaign(EmailCampaign campaign) {
        // Get up to 50 pending recipients
        List<CampaignRecipient> pendingRecipients = recipientRepository.findByCampaignIdAndStatus(campaign.getId(), "PENDING", PageRequest.of(0, 50));
        
        if (pendingRecipients.isEmpty()) {
            // Check if there are any recipients left at all (maybe all sent or failed)
            long remaining = recipientRepository.countByCampaignIdAndStatus(campaign.getId(), "PENDING");
            if (remaining == 0) {
                campaign.setStatus("COMPLETED");
                campaignRepository.save(campaign);
                log.info("Campaign {} marked as COMPLETED", campaign.getId());
            }
            return;
        }

        for (CampaignRecipient recipient : pendingRecipients) {
            try {
                Customer customer = customerRepository.findById(recipient.getCustomerId()).orElse(null);
                
                if (customer != null) {
                    // Simple variable replacement
                    String personalizedHtml = campaign.getHtmlContent()
                            .replace("{{customerName}}", customer.getName() != null ? customer.getName() : "Khách hàng");
                    
                    emailSenderService.send(recipient.getEmail(), campaign.getSubject(), personalizedHtml);
                }
                
                recipient.setStatus("SENT");
                recipient.setSentAt(LocalDateTime.now());
            } catch (Exception e) {
                log.error("Failed to send email to {}", recipient.getEmail(), e);
                recipient.setStatus("FAILED");
                recipient.setErrorMessage(e.getMessage());
            }
            recipientRepository.save(recipient);
        }
    }
}
