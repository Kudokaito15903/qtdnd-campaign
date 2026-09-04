package com.example.demo.controller;

import com.example.demo.dto.CampaignSummaryDto;
import com.example.demo.dto.TemplateSummaryDto;
import com.example.demo.entity.EmailCampaign;
import com.example.demo.entity.EmailTemplate;
import com.example.demo.repository.EmailCampaignRepository;
import com.example.demo.repository.EmailTemplateRepository;
import com.example.demo.service.EmailCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class EmailCampaignController {

    private final EmailCampaignRepository campaignRepository;
    private final EmailTemplateRepository templateRepository;
    private final EmailCampaignService campaignService;

    @GetMapping
    public List<CampaignSummaryDto> getAllCampaigns() {
        return campaignRepository.findCampaignSummaries();
    }

    @PostMapping
    public EmailCampaign createCampaign(@RequestBody EmailCampaign campaign) {
        if (campaign.getStatus() == null) {
            campaign.setStatus("CREATED");
        }
        return campaignRepository.save(campaign);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<String> startCampaign(@PathVariable Long id) {
        try {
            campaignService.prepareCampaign(id);
            return ResponseEntity.ok("Campaign " + id + " is now processing.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/templates")
    public List<TemplateSummaryDto> getAllTemplates() {
        return templateRepository.findTemplateSummaries();
    }

    @GetMapping("/templates/{id}")
    public EmailTemplate getTemplateById(@PathVariable Long id) {
        return templateRepository.findById(id).orElseThrow();
    }

    @PostMapping("/templates")
    public EmailTemplate createTemplate(@RequestBody EmailTemplate template) {
        return templateRepository.save(template);
    }

    @PutMapping("/templates/{id}")
    public EmailTemplate updateTemplate(@PathVariable Long id, @RequestBody EmailTemplate templateDetails) {
        EmailTemplate template = templateRepository.findById(id).orElseThrow();
        template.setName(templateDetails.getName());
        template.setSubject(templateDetails.getSubject());
        template.setHtmlContent(templateDetails.getHtmlContent());
        return templateRepository.save(template);
    }

    @DeleteMapping("/templates/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        templateRepository.deleteById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
    }
}
