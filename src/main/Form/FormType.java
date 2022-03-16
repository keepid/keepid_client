package Form;

public enum FormType {
  APPLICATION("application"),
  IDENTIFICATION("identification"),
  FORM("form");

  private String formType;

  FormType(String formType) {
    this.formType = formType;
  }

  public String toString() {
    return this.formType;
  }

  public static FormType createFromString(String formTypeString) {
    switch (formTypeString) {
      case "APPLICATION":
        return FormType.APPLICATION;
      case "IDENTIFICATION":
        return FormType.IDENTIFICATION;
      case "FORM":
        return FormType.FORM;
      default:
        return null;
    }
  }
}
