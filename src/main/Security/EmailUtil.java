package Security;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Objects;
import java.util.Properties;

public class EmailUtil {
  public static void sendEmail(
      String senderName, String recipientEmail, String subject, String message)
      throws UnsupportedEncodingException {

    // Set SMTP server properties.
    Properties properties = System.getProperties();
    properties.put("mail.smtp.host", Objects.requireNonNull(System.getenv("EMAIL_HOST")));
    properties.put("mail.smtp.port", Objects.requireNonNull(System.getenv("EMAIL_PORT")));
    properties.put("mail.smtp.auth", "true");
    properties.put(
        "mail.smtp.starttls.enable", "true"); // creates a new session with an authenticator

    Session session =
        Session.getDefaultInstance(
            properties,
            new javax.mail.Authenticator() {
              protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                    Objects.requireNonNull(System.getenv("EMAIL_ADDRESS")),
                    Objects.requireNonNull(
                        System.getenv("EMAIL_PASSWORD"))); // Specify the Username and the PassWord
              }
            });

    // Creates a new Email message.
    try {
      Message msg = new MimeMessage(session);
      msg.setFrom(
          new InternetAddress(Objects.requireNonNull(System.getenv("EMAIL_ADDRESS")), senderName));
      InternetAddress[] toAddresses = {new InternetAddress(recipientEmail)};
      msg.setRecipients(Message.RecipientType.TO, toAddresses);
      msg.setSubject(subject);
      msg.setSentDate(new Date());
      msg.setContent(message, "text/html; charset=utf-8");

      // Send the Email.
      Transport.send(msg);
    } catch (MessagingException e) {
      e.printStackTrace();
    }
  }
}
