package Validation;

import java.util.regex.Pattern;

public class ValRegex {

  public static final String validCharacters =
      "a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð";

  public static final Pattern namePattern =
      Pattern.compile("^[" + validCharacters + ", .'-]{1,150}$");

  public static final Pattern birthDatePattern = Pattern.compile("^[0-9]{2}-[0-9]{2}-[0-9]{4}$");

  public static final Pattern orgEINPattern = Pattern.compile("^([0-9]{2}(-)?[0-9]{7})$");

  public static final Pattern emailPattern =
      Pattern.compile(
          "^[" + validCharacters + "0-9_!#$%&’*+=?`{|}~^.-]{1,150}@[a-zA-Z0-9.-]{1,150}$");

  // found
  // https://stackoverflow.com/questions/42104546/java-regular-expressions-to-validate-phone-numbers
  public static final Pattern phoneNumberPattern =
      Pattern.compile(
          "^(\\+)?\\(?(1)?\\)?(-)?(\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)(-)?\\d{3}-?\\d{4})$");

  public static final Pattern zipCodePattern = Pattern.compile("^([0-9]{5}(?:-[0-9]{4})?)$");

  public static final Pattern usStatePattern =
      Pattern.compile(
          "^(?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$");

  public static final Pattern cityPattern =
      Pattern.compile(
          "^(["
              + validCharacters
              + "]{1,150}((\\s|-|.){0,150})["
              + validCharacters
              + "]{0,150})"
              + "{1,5}$");

  public static final Pattern streetPattern =
      Pattern.compile("^[" + validCharacters + ", .'-[0-9]]{1,150}$");

  public static final Pattern usernamePattern =
      Pattern.compile("^[" + validCharacters + "_-[0-9]]{1,150}$");
}
