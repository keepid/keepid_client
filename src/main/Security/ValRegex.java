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
          "^(Alabama|Alaska|American Samoa|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District Of Columbia"
              + "|Federated States Of Micronesia|Florida|Georgia|Guam|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Marshall Islands"
              + "|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|"
              + "New Mexico|New York|North Carolina|North Dakota|Northern Mariana Islands|Ohio|Oklahoma|Oregon|Palau|Pennsylvania|Puerto Rico|"
              + "Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virgin Islands|Virginia|Washington|West Virginia|Wisconsin|Wyoming)$");

  public static final Pattern cityPattern =
      Pattern.compile("^[a-zA-Z]+(?:(?:\\s+|-)[a-zA-Z]+)" + "*$");

  // found
  // https://stackoverflow.com/questions/42104546/java-regular-expressions-to-validate-phone-numbers
  public static final Pattern phoneNumberPattern =
      Pattern.compile("\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)\\d{3}-?\\d{4}");
}
