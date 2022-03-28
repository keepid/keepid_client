package Form;

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public class Form {
  private ObjectId id;
  private ObjectId fileId;

  private Metadata metadata;

  private Section body;

  @BsonProperty(value = "uploadedAt")
  private Date uploadedAt;

  @BsonProperty(value = "lastModifiedAt")
  private Date lastModifiedAt;

  @BsonProperty(value = "firstName")
  private String username;

  @BsonProperty(value = "lastName")
  private String uploaderUsername;

  @BsonProperty(value = "formType")
  private FormType formType;

  @BsonProperty(value = "isTemplate")
  private boolean isTemplate;

  public Form() {}

  public static class Metadata {
    String title;
    String description;
    String state;
    String county;
    Set<ObjectId> prerequisities;
    Date lastRevisionDate;
    // In order, amount of payment, method of payment,
    // who to send money to, and address
    List<String> paymentInfo;
    int numLines;

    public Metadata(
        String title,
        String description,
        String state,
        String county,
        Set<ObjectId> prerequisities,
        Date lastRevisionDate,
        List<String> paymentInfo,
        int numLines) {
      this.title = title;
      this.description = description;
      this.state = state;
      this.county = county;
      this.prerequisities = prerequisities;
      this.lastRevisionDate = lastRevisionDate;
      this.numLines = numLines;
      this.paymentInfo = paymentInfo;
    }
  }

  public static class Section {
    String title;
    String description;
    List<Section> subsections;
    List<Question> questions;

    public Section(
        String title, String description, List<Section> subsections, List<Question> questions) {
      this.title = title;
      this.description = description;
      this.subsections = subsections;
      this.questions = questions;
    }
  }

  public class Question {
    ObjectId id;
    FieldType type;
    String questionText;
    List<String> options;
    String defaultValue;
    boolean required;
    int numLines;
    boolean matched;
    ObjectId conditionalOnField;
    // true for positive, false for negative
    boolean conditionalType;

    public Question(
        ObjectId id,
        FieldType type,
        String questionText,
        List<String> options,
        String defaultValue,
        boolean required,
        int numLines,
        boolean matched,
        ObjectId conditionalOnField,
        boolean conditionalType) {
      this.id = id;
      this.type = type;
      this.questionText = questionText;
      this.options = options;
      this.defaultValue = defaultValue;
      this.required = required;
      this.numLines = numLines;
      this.matched = matched;
      this.conditionalOnField = conditionalOnField;
      this.conditionalType = conditionalType;
    }
  }

  public Form(
      String username,
      Optional<String> uploaderUsername,
      Date uploadedAt,
      Optional<Date> lastModifiedAt,
      FormType formType,
      boolean isTemplate,
      Metadata metadata,
      Section body) {
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

  public Date getLastModifiedAt() {
    return lastModifiedAt;
  }

  public Date getUploadedAt() {
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

  public Metadata getMetadata() {
    return metadata;
  }

  public Section getBody() {
    return body;
  }

  /** **************** SETTERS ********************* */
  public void setFileId(ObjectId fileId) {
    this.fileId = fileId;
  }

  public void setId(ObjectId id) {
    this.id = id;
  }

  public void setLastModifiedAt(Date lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
  }

  public void setPdfType(FormType pdfType) {
    this.formType = formType;
  }

  public void setUploaderUsername(String uploaderUsername) {
    this.uploaderUsername = uploaderUsername;
  }

  public void setUploadedAt(Date uploadedAt) {
    this.uploadedAt = uploadedAt;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setMetadata(Metadata metadata) {
    this.metadata = metadata;
  }

  public void setBody(Section body) {
    this.body = body;
  }
}
