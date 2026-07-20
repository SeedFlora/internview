package com.example.skripsi.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink, int expiryMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Reset your InternView password");
        message.setText(
                "Halo,\n\n" +
                "Kami menerima permintaan untuk mengatur ulang kata sandi akun InternView kamu.\n" +
                "Klik tautan berikut untuk membuat kata sandi baru:\n\n" +
                resetLink + "\n\n" +
                "Tautan ini berlaku selama " + expiryMinutes + " menit dan hanya dapat digunakan satu kali.\n" +
                "Jika kamu tidak meminta pengaturan ulang ini, abaikan email ini -- kata sandimu tidak berubah.\n\n" +
                "Salam,\nTim InternView"
        );
        mailSender.send(message);
        log.info("[email] password reset sent to {}", toEmail);
    }
}
