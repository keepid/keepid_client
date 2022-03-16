package Form;

import com.google.api.client.util.DateTime;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import java.util.Optional;

public class Form {
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

  @BsonProperty(value = "formType")
  private FormType formType;

  @BsonProperty(value = "isTemplate")
  private boolean isTemplate;

  @BsonProperty(value = "isTemplate")
  private JSONObject metadata;

  @BsonProperty(value = "isTemplate")
  private JSONObject body;

  public Form() {}

  public Form(
      String username,
      Optional<String> uploaderUsername,
      DateTime uploadedAt,
      Optional<DateTime> lastModifiedAt,
      FormType formType,
      boolean isTemplate,
      JSONObject metadata,
      JSONObject body) {
    this.id = new ObjectId();
    this.fileId = new ObjectId();
    this.username = username;
    this.uploaderUsername = uploaderUsername.orElse(username);
    this.uploadedAt = uploadedAt;
    this.lastModifiedAt = lastModifiedAt.orElse(uploadedAt);
    this.formType = formType;
    this.isTemplate = isTemplate;
    this.metadata = metadata;
    this.body = body;
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

  public FormType getFormType() {
    return formType;
  }

  public String getUsername() {
    return username;
  }

  public String getUploaderUsername() {
    return uploaderUsername;
  }

  public boolean isTemplate() {
    return isTemplate;
  }

  public JSONObject getMetadata() {
    return metadata;
  }

  public JSONObject getBody() {
    return body;
  }

  /** **************** SETTERS ********************* */
  public void setFileId(ObjectId fileId) {
    this.fileId = fileId;
  }

  public void setId(ObjectId id) {
    this.id = id;
  }

  public void setLastModifiedAt(DateTime lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
  }

  public void setPdfType(FormType pdfType) {
    this.formType = formType;
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

  public void setMetadata(JSONObject metadata) {
    this.metadata = metadata;
  }

  public void setBody(JSONObject body) {
    this.body = body;
  }
}
