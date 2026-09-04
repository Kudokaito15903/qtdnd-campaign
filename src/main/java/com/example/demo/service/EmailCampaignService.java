package com.example.demo.service;

import com.example.demo.entity.CampaignRecipient;
import com.example.demo.entity.Customer;
import com.example.demo.entity.EmailCampaign;
import com.example.demo.repository.CampaignRecipientRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.EmailCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailCampaignService {

    private final EmailCampaignRepository campaignRepository;
    private final CustomerRepository customerRepository;
    private final CampaignRecipientRepository recipientRepository;

    @Transactional
    public void prepareCampaign(Long campaignId) {
        EmailCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (!"SCHEDULED".equals(campaign.getStatus()) && !"CREATED".equals(campaign.getStatus())) {
            throw new IllegalStateException("Campaign is not in a startable state: " + campaign.getStatus());
        }

        // Get all customers who consented to marketing and have not unsubscribed
        List<Customer> targetCustomers = customerRepository.findEligibleForCampaign();

        // Save recipients in bulk
        List<CampaignRecipient> recipients = new java.util.ArrayList<>();
        for (Customer customer : targetCustomers) {
            CampaignRecipient recipient = new CampaignRecipient();
            recipient.setCampaignId(campaign.getId());
            recipient.setCustomerId(customer.getId());
            recipient.setEmail(customer.getEmail());
            recipient.setStatus("PENDING");
            recipients.add(recipient);
        }
        recipientRepository.saveAll(recipients);

        campaign.setStatus("PROCESSING");
        campaignRepository.save(campaign);
        
        log.info("Prepared campaign {}: created {} recipients", campaign.getId(), targetCustomers.size());
    }

    @Transactional
    public void deleteCampaign(Long campaignId) {
        // Xóa tất cả recipient thuộc về campaign này trước
        recipientRepository.deleteByCampaignId(campaignId);
        // Sau đó mới xóa campaign
        campaignRepository.deleteById(campaignId);
        log.info("Deleted campaign {} and its recipients", campaignId);
    }
}
