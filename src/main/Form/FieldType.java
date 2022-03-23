package Form;

public enum FieldType {
  TEXT_FIELD("textField"),
  CHECKBOX("checkBox"),
  MULTIPLE_CHOICE("multipleChoice"),
  SIGNATURE("signature");

  private String fieldType;

  FieldType(String fieldType) {
    this.fieldType = fieldType;
  }

  public String toString() {
    return this.fieldType;
  }

  public static FieldType createFromString(String fieldTypeString) {
    switch (fieldTypeString) {
      case "textField":
        return FieldType.TEXT_FIELD;
      case "checkBox":
        return FieldType.CHECKBOX;
      case "multipleChoice":
        return FieldType.MULTIPLE_CHOICE;
      case "signature":
        return FieldType.SIGNATURE;
      default:
        return null;
    }
  }
}
