package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "email_campaign_recipient",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"campaign_id", "customer_id"})
    }
)
@Data
@NoArgsConstructor
public class CampaignRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "campaign_id", nullable = false)
    private Long campaignId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(nullable = false, length = 320)
    private String email;

    // e.g. PENDING, SENT, FAILED
    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
