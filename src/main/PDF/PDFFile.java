package PDF;

import java.io.InputStream;

public class PDFFile {
  private InputStream stream;
  private String filename;

  public PDFFile(InputStream stream, String filename) {
    this.stream = stream;
    this.filename = filename;
  }

  public InputStream getStream() {
    return stream;
  }

  public String getFilename() {
    return filename;
  }
}
