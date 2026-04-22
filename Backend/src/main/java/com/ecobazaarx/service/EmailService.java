package com.ecobazaarx.service;

import com.ecobazaarx.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String toEmail;

    public void sendContactEmail(ContactRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("EcoBazaarX Contact: " + request.getTopic());
        message.setText(
            "Name:    " + request.getName()    + "\n" +
            "Email:   " + request.getEmail()   + "\n" +
            "Topic:   " + request.getTopic()   + "\n\n" +
            "Message:\n" + request.getMessage()
        );
        message.setReplyTo(request.getEmail());
        mailSender.send(message);
    }
}