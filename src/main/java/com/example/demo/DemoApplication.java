package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmailCampaignService;

@SpringBootApplication
@EnableScheduling
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner testRunner(
			CustomerRepository customerRepository,
			EmailTemplateRepository templateRepository,
			EmailCampaignRepository campaignRepository,
			EmailCampaignService campaignService) {
		return args -> {
			// Chỉ tạo test data nếu DB chưa có customer nào
			if (customerRepository.count() == 0) {
				System.out.println(">>> Đang tạo dữ liệu test...");
				
				// 1. Tạo Customer test (Gửi về chính email của bạn để test)
				Customer customer = new Customer();
				customer.setName("Kudo Kaito");
				customer.setEmail("kudokaito15903@gmail.com"); 
				customer.setMarketingConsent(true);
				customer.setUnsubscribed(false);
				customerRepository.save(customer);

				// 2. Tạo Template
				EmailTemplate template = new EmailTemplate();
				template.setName("Welcome Template");
				template.setSubject("Test Hệ Thống Gửi Email - Spring Boot");
				template.setHtmlContent("<h2>Xin chào {{customerName}},</h2><p>Hệ thống gửi email của bạn đã hoạt động thành công xuất sắc! 🎉</p><p>Được gửi từ Spring Boot + Supabase.</p>");
				templateRepository.save(template);

				// 3. Tạo Campaign
				EmailCampaign campaign = new EmailCampaign();
				campaign.setName("Chiến dịch Test 1");
				campaign.setSubject(template.getSubject());
				campaign.setHtmlContent(template.getHtmlContent());
				campaign.setStatus("CREATED");
				campaign = campaignRepository.save(campaign);

				// 4. Kích hoạt Campaign
				campaignService.prepareCampaign(campaign.getId());
				System.out.println(">>> Đã kích hoạt chiến dịch test. Đang chờ Worker xử lý và gửi email...");
			} else {
				System.out.println(">>> Bỏ qua tạo dữ liệu test vì DB đã có dữ liệu.");
			}
		};
	}
}
