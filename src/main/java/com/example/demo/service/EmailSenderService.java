package com.example.demo.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void send(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        // Cờ 'true' cho biết đây là multipart message (hỗ trợ đính kèm/inline)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);

        // Bóc tách Base64 images từ nội dung HTML
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("src=[\"']data:image/([^;]+);base64,([^\"']+)[\"']");
        java.util.regex.Matcher matcher = pattern.matcher(htmlContent);
        StringBuffer sb = new StringBuffer();
        int imageIndex = 0;
        
        java.util.List<String[]> inlineImages = new java.util.ArrayList<>();
        
        while (matcher.find()) {
            String extension = matcher.group(1);
            String base64Data = matcher.group(2);
            String cid = "image" + imageIndex;
            
            // Lưu lại thông tin để đính kèm sau khi set text
            inlineImages.add(new String[]{cid, extension, base64Data});
            
            // Thay thế chuỗi base64 khổng lồ bằng cú pháp đính kèm cid: của email
            matcher.appendReplacement(sb, "src=\"cid:" + cid + "\"");
            imageIndex++;
        }
        matcher.appendTail(sb);
        
        // Cài đặt HTML đã được thay thế
        helper.setText(sb.toString(), true);
        
        // Đính kèm các ảnh thật vào trong thư (phải làm sau khi setText)
        for (String[] img : inlineImages) {
            byte[] imageBytes = java.util.Base64.getDecoder().decode(img[2]);
            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(imageBytes);
            helper.addInline(img[0], resource, "image/" + img[1]);
        }
        
        javaMailSender.send(message);
    }
}
