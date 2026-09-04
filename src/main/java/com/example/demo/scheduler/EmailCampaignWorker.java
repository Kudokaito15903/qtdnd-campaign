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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailCampaignWorker {

    private final EmailCampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final CustomerRepository customerRepository;
    private final EmailSenderService emailSenderService;
    private final EmailCampaignService emailCampaignService; // Injected to correctly prepare campaigns

    // Khởi tạo một Thread Pool với 10 luồng chạy song song
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

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
                long failedCount = recipientRepository.countByCampaignIdAndStatus(campaign.getId(), "FAILED");
                if (failedCount > 0) {
                    campaign.setStatus("FAILED");
                    log.info("Campaign {} marked as FAILED ({} failed recipients)", campaign.getId(), failedCount);
                } else {
                    campaign.setStatus("COMPLETED");
                    log.info("Campaign {} marked as COMPLETED", campaign.getId());
                }
                campaignRepository.save(campaign);
            }
            return;
        }

        // Sử dụng đa luồng để gửi đồng loạt (song song) thay vì gửi tuần tự từng người
        List<CompletableFuture<Void>> futures = pendingRecipients.stream()
                .map(recipient -> CompletableFuture.runAsync(() -> {
                    try {
                        Customer customer = customerRepository.findById(recipient.getCustomerId()).orElse(null);
                        
                        if (customer != null) {
                            String personalizedHtml = campaign.getHtmlContent()
                                    .replace("{{customerName}}", customer.getName() != null ? customer.getName() : "Khách hàng");
                            
                            emailSenderService.send(recipient.getEmail(), campaign.getSubject(), personalizedHtml);
                            log.info("Gửi email thành công tới: {}", recipient.getEmail());
                        }
                        
                        recipient.setStatus("SENT");
                        recipient.setSentAt(LocalDateTime.now());
                    } catch (Exception e) {
                        log.error("Failed to send email to {}", recipient.getEmail(), e);
                        recipient.setStatus("FAILED");
                        recipient.setErrorMessage(e.getMessage());
                    }
                    recipientRepository.save(recipient);
                }, executorService))
                .toList();

        // Chờ tất cả 50 người trong lô này gửi xong thì mới kết thúc hàm
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }
}
