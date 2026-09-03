package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailSenderService {

    private final JavaMailSender mailSender;

    public void send(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);

        // Regex tìm các ảnh Base64 (src="data:image/png;base64,...")
        Pattern pattern = Pattern.compile("src=[\"']data:image/([^;]+);base64,([^\"']+)[\"']");
        Matcher matcher = pattern.matcher(html);
        StringBuffer sb = new StringBuffer();
        
        List<InlineImage> inlineImages = new ArrayList<>();
        int counter = 0;

        while (matcher.find()) {
            String extension = matcher.group(1);
            String base64Data = matcher.group(2);
            String cid = "img_" + counter;
            
            // Thay thế src bằng cid
            matcher.appendReplacement(sb, "src=\"cid:" + cid + "\"");
            
            try {
                byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
                inlineImages.add(new InlineImage(cid, decodedBytes, "image/" + extension));
            } catch (Exception e) {
                // Nếu lỗi giải mã, bỏ qua
            }
            counter++;
        }
        matcher.appendTail(sb);
        
        // Cài đặt nội dung HTML đã thay đổi src thành cid
        helper.setText(sb.toString(), true);

        // Thêm các ảnh dưới dạng inline
        for (InlineImage img : inlineImages) {
            helper.addInline(img.cid, new ByteArrayResource(img.data), img.contentType);
        }

        mailSender.send(message);
    }

    private static class InlineImage {
        String cid;
        byte[] data;
        String contentType;

        InlineImage(String cid, byte[] data, String contentType) {
            this.cid = cid;
            this.data = data;
            this.contentType = contentType;
        }
    }
}
