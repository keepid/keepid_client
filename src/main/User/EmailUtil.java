package User;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Properties;

public class EmailUtil {
  public static void sendEmail(
      String host,
      String port,
      final String senderEmail,
      String senderName,
      final String password,
      String recipientEmail,
      String subject,
      String message)
      throws AddressException, MessagingException, UnsupportedEncodingException {

    // sets SMTP server properties
    Properties properties = System.getProperties();
    properties.put("mail.smtp.host", host);
    properties.put("mail.smtp.port", port);
    properties.put("mail.smtp.auth", "true");
    properties.put(
        "mail.smtp.starttls.enable", "true"); // creates a new session with an authenticator
    Session session =
        Session.getDefaultInstance(
            properties,
            new javax.mail.Authenticator() {
              protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                    senderEmail, password); // Specify the Username and the PassWord
              }
            });
    // creates a new e-mail message
    try {
      Message msg = new MimeMessage(session);
      msg.setFrom(new InternetAddress(senderEmail, senderName));
      InternetAddress[] toAddresses = {new InternetAddress(recipientEmail)};
      msg.setRecipients(Message.RecipientType.TO, toAddresses);
      msg.setSubject(subject);
      msg.setSentDate(new Date());
      msg.setText(message);

      // sends the e-mail
      Transport.send(msg);
    } catch (MessagingException e) {
      e.printStackTrace();
    }
  }
}
