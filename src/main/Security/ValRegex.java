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
          "^(ALABAMA|ALASKA|AMERICAN SAMOA|ARIZONE|ARKANSAS|CALIFORNIA|COLORADO|CONNECTICUT|DELAWARE|DISTRICT OF COLUMBIA"
              + "|FEDERATED STATES OF MICRONESIA|FLORIDA|GEORGIA|GUAM|HAWAII|IDAHO|ILLINOIS|INDIANA|IOWA|KANSAS|KENTUCKY|LOUISIANA|MAINE|MARSHALL ISLANDS"
              + "|MARYLAND|MASSACHUSETTS|MICHIGAN|MINNESOTA|MISSISSIPPI|MISSOURI|MONTANA|NEBRASKA|NEVADA|NEW HAMPSHIRE|NEW JERSEY|"
              + "NEW MEXICO|NEW YORK|NORTH CAROLINA|NORTH DAKOTA|NORTHERN MARIANA ISLANDS|OHIO|OKLAHOMA|OREGON|PALAU|PENNSYLVANIA|PUERTO RICO|"
              + "RHODE ISLAND|SOUTH CAROLINA|SOUTH DAKOTA|TENNESSEE|TEXAS|UTAH|VERMONT|VIRGIN ISLANDS|VIRGINIA|WASHINGTON|WEST VIRGINIA|WISCONSIN|WYOMING)$");

  public static final Pattern cityPattern =
      Pattern.compile("^[a-zA-Z]+(?:(?:\\s+|-)[a-zA-Z]+)" + "*$");

  // found
  // https://stackoverflow.com/questions/42104546/java-regular-expressions-to-validate-phone-numbers
  public static final Pattern phoneNumberPattern =
      Pattern.compile("\\d{10}|(?:\\d{3}-){2}\\d{4}|\\(\\d{3}\\)\\d{3}-?\\d{4}");
}
