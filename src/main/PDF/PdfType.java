package PDF;

public enum PdfType {
  APPLICATION("application"),
  IDENTIFICATION("identification"),
  FORM("form");

  private String pdfType;

  PdfType(String pdfType) {
    this.pdfType = pdfType;
  }

  public String toString() {
    return this.pdfType;
  }

  public static PdfType createFromString(String pdfTypeString) {
    switch (pdfTypeString) {
      case "APPLICATION":
        return PdfType.APPLICATION;
      case "IDENTIFICATION":
        return PdfType.IDENTIFICATION;
      case "FORM":
        return PdfType.FORM;
      default:
        return null;
    }
  }
}
