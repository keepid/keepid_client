package Security;

import Validation.ValidationUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.file.Paths;
import java.util.Date;
import java.util.Objects;
import java.util.Properties;

public class EmailUtil {
  private static String verificationCodeEmailPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "main"
          + File.separator
          + "Security"
          + File.separator
          + "verificationCodeEmail.html";

  private static String passwordResetLinkEmailPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "main"
          + File.separator
          + "Security"
          + File.separator
          + "passwordResetLinkEmail.html";

  private static String organizationInviteEmailPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "main"
          + File.separator
          + "Security"
          + File.separator
          + "organizationInviteEmail.html";

  public void sendEmail(String senderName, String recipientEmail, String subject, String message)
      throws EmailExceptions, UnsupportedEncodingException {

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
    if (!ValidationUtils.isValidEmail(recipientEmail)) {
      throw new EmailExceptions(EmailMessages.NOT_VALID_EMAIL);
    }
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

  public String getVerificationCodeEmail(String verificationCode) throws EmailExceptions {
    File verificationCodeEmail = new File(verificationCodeEmailPath);
    try {
      Document htmlDoc = Jsoup.parse(verificationCodeEmail, "UTF-8");
      Element targetElement = htmlDoc.getElementById("targetVerificationCode");
      if (targetElement != null) {
        targetElement.text(verificationCode);
      } else {
        throw new EmailExceptions(EmailMessages.CODE_DOM_NOT_FOUND);
      }
      return htmlDoc.toString();
    } catch (FileNotFoundException e) {
      throw new EmailExceptions(EmailMessages.HTML_NOT_FOUND);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public String getPasswordResetEmail(String jwt) throws EmailExceptions {
    File passwordResetEmail = new File(passwordResetLinkEmailPath);
    try {
      Document htmlDoc = Jsoup.parse(passwordResetEmail, "UTF-8");
      Element targetElement = htmlDoc.getElementById("hrefTarget");
      if (targetElement != null) {
        targetElement.attr("href", jwt);
      } else {
        throw new EmailExceptions(EmailMessages.EMAIL_DOM_NOT_FOUND);
      }
      return htmlDoc.toString();
    } catch (FileNotFoundException e) {
      throw new EmailExceptions(EmailMessages.HTML_NOT_FOUND);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public String getOrganizationInviteEmail(String jwt, String inviter, String receiver)
      throws EmailExceptions {
    try {
      File organizationInviteEmail = new File(organizationInviteEmailPath);
      Document htmlDoc = Jsoup.parse(organizationInviteEmail, "UTF-8");
      Element targetLink = htmlDoc.getElementById("hrefTarget");
      if (targetLink != null) {
        targetLink.attr("href", jwt);
      } else {
        throw new EmailExceptions(EmailMessages.EMAIL_DOM_NOT_FOUND);
      }
      Element targetName = htmlDoc.getElementById("targetName");
      if (targetName != null) {
        targetName.text(receiver);
      } else {
        throw new EmailExceptions(EmailMessages.RECEIVER_DOM_NOT_FOUND);
      }
      Element inviterName = htmlDoc.getElementById("inviterName");
      if (inviterName != null) {
        inviterName.text(inviter);
      } else {
        throw new EmailExceptions(EmailMessages.INVITER_DOM_NOT_FOUND);
      }
      return htmlDoc.toString();
    } catch (FileNotFoundException e) {
      throw new EmailExceptions(EmailMessages.HTML_NOT_FOUND);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }
}
