package Security;

import java.util.regex.Pattern;

public class ValRegex {

  public static final Pattern namePattern =
      Pattern.compile(
          "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{1,100}$");

  public static final Pattern emailPattern =
      Pattern.compile("^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$");

  public static final Pattern orgNamePattern =
      Pattern.compile(
          "^[a-zA-Z0-9àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{1,200}$");

  public static final Pattern zipCodePattern = Pattern.compile("^\\d{5}(-\\d{4})?$");

  public static final Pattern usStatePattern =
      Pattern.compile(
          "^(AA|AE|AP|AL|AK|AS|AZ|AR|CA|CO"
              + "|CT|DE|DC|FM|FL|GA|GU|HI|ID|IL|IN|IA|KS|KY|LA|ME|MH|MD|MA|MI|MN|MS|MO|MT|NE|"
              + "NV|NH|NJ|NM|NY|NC|ND|MP|OH|OK|OR|PW|PA|PR|RI|SC|SD|TN|TX|UT|VT|VI|VA|WA|WV|WI|WY)$");

  public static final Pattern cityPattern =
      Pattern.compile("^[a-zA-Z]+(?:(?:\\s+|-)[a-zA-Z]+)" + "*$");

  // found
  // https://stackoverflow.com/questions/42104546/java-regular-expressions-to-validate-phone-numbers
  public static final Pattern phoneNumberPattern =
      Pattern.compile("\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)\\d{3}-?\\d{4}");
}
