package PDF;

import com.google.api.client.util.DateTime;
import lombok.extern.slf4j.Slf4j;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.io.InputStream;
import java.util.Optional;

@Slf4j
public class PDF {
  private ObjectId id;
  private ObjectId fileId;

  @BsonProperty(value = "uploadedAt")
  private DateTime uploadedAt;

  @BsonProperty(value = "lastModifiedAt")
  private DateTime lastModifiedAt;

  @BsonProperty(value = "firstName")
  private String username;

  @BsonProperty(value = "lastName")
  private String uploaderUsername;

  private InputStream fileStream;

  @BsonProperty(value = "pdfType")
  private PDFType pdfType;

  public PDF() {}

  public PDF(
      String username,
      Optional<String> uploaderUsername,
      DateTime uploadedAt,
      Optional<DateTime> lastModifiedAt,
      InputStream fileStream,
      PDFType pdfType) {
    this.id = new ObjectId();
    this.fileId = new ObjectId();
    this.username = username;
    this.uploaderUsername = uploaderUsername.orElse(username);
    this.uploadedAt = uploadedAt;
    this.lastModifiedAt = lastModifiedAt.orElse(uploadedAt);
    this.fileStream = fileStream;
    this.pdfType = pdfType;
  }

  /** **************** GETTERS ********************* */
  public ObjectId getId() {
    return this.id;
  }

  public ObjectId getFileId() {
    return this.fileId;
  }

  public DateTime getLastModifiedAt() {
    return lastModifiedAt;
  }

  public DateTime getUploadedAt() {
    return uploadedAt;
  }

  public InputStream getFileStream() {
    return fileStream;
  }

  public PDFType getPdfType() {
    return pdfType;
  }

  public String getUsername() {
    return username;
  }

  public String getUploaderUsername() {
    return uploaderUsername;
  }

  /** **************** SETTERS ********************* */
  public void setFileId(ObjectId fileId) {
    this.fileId = fileId;
  }

  public void setFileStream(InputStream fileStream) {
    this.fileStream = fileStream;
  }

  public void setId(ObjectId id) {
    this.id = id;
  }

  public void setLastModifiedAt(DateTime lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
  }

  public void setPdfType(PDFType pdfType) {
    this.pdfType = pdfType;
  }

  public void setUploaderUsername(String uploaderUsername) {
    this.uploaderUsername = uploaderUsername;
  }

  public void setUploadedAt(DateTime uploadedAt) {
    this.uploadedAt = uploadedAt;
  }

  public void setUsername(String username) {
    this.username = username;
  }
}
