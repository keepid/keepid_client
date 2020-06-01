package PDFUpload;

public enum PDFType {
  APPLICATION("application"),
  IDENTIFICATION("identification"),
  FORM("form");

  private String pdfType;

  PDFType(String pdfType) {
    this.pdfType = pdfType;
  }

  public String toString() {
    return this.pdfType;
  }

  public static PDFType createFromString(String pdfTypeString) {
    switch (pdfTypeString) {
      case "Application":
        return PDFType.APPLICATION;
      case "Identification":
        return PDFType.IDENTIFICATION;
      case "Form":
        return PDFType.FORM;
      default:
        return null;
    }
  }
}
