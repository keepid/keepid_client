package Validation;

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

  public static final Pattern zipCodePattern = Pattern.compile("^([0-9]{5}(?:-[0-9]{4})?)*$");

  public static final Pattern usStatePattern =
      Pattern.compile(
          "^(?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])*$");

  public static final Pattern cityPattern =
      Pattern.compile("^[a-zA-Z]+(?:(?:\\s+|-)[a-zA-Z]+)" + "*$");

  // found
  // https://stackoverflow.com/questions/42104546/java-regular-expressions-to-validate-phone-numbers
  public static final Pattern phoneNumberPattern =
      Pattern.compile("\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)\\d{3}-?\\d{4}");
}
