package Organization;

public enum OrganizationValidationMessage {
  INVALID_NAME,
  INVALID_WEBSITE,
  INVALID_EIN,
  INVALID_PHONE,
  INVALID_EMAIL,
  INVALID_ADDRESS,
  INVALID_CITY,
  INVALID_STATE,
  INVALID_ZIPCODE,
  VALID;

  public static String toOrganizationMessageJSON(OrganizationValidationMessage v) {
    switch (v) {
      case INVALID_NAME:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Name");
      case INVALID_WEBSITE:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Website");
      case INVALID_EIN:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization EIN");
      case INVALID_PHONE:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Phone");
      case INVALID_EMAIL:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Email");
      case INVALID_ADDRESS:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Address");
      case INVALID_CITY:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization City");
      case INVALID_STATE:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization State");
      case INVALID_ZIPCODE:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Zipcode");
      case VALID:
        return OrgEnrollmentStatus.SUCCESS.toJSON();
      default:
        return OrgEnrollmentStatus.INVALID_PARAMETER.toJSON();
    }
  }
}
