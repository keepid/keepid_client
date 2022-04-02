package Form;

import org.bson.BsonReader;
import org.bson.BsonWriter;
import org.bson.codecs.Codec;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.EncoderContext;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.util.*;

public class Form {
  private ObjectId id;
  private ObjectId fileId;

  private Metadata metadata;

  private Section body;

  @BsonProperty(value = "uploadedAt")
  private Date uploadedAt;

  @BsonProperty(value = "lastModifiedAt")
  private Date lastModifiedAt;

  @BsonProperty(value = "username")
  private String username;

  @BsonProperty(value = "uploaderUserName")
  private String uploaderUsername;

  @BsonProperty(value = "formType")
  private FormType formType;

  @BsonProperty(value = "isTemplate")
  private boolean isTemplate;

  public Form() {}

  public static class MetadataCodec implements Codec<Metadata> {
    @Override
    public void encode(BsonWriter writer, Metadata value, EncoderContext encoderContext) {
      if (value != null) {
        writer.writeStartDocument();
        writer.writeName("title");
        writer.writeString(value.title);
        writer.writeName("description");
        writer.writeString(value.description);
        writer.writeName("state");
        writer.writeString(value.state);
        writer.writeName("county");
        writer.writeString(value.county);
        writer.writeName("lines");
        writer.writeInt32(value.numLines);
        writer.writeName("date");
        writer.writeDateTime(value.lastRevisionDate.getTime());
        writer.writeName("prereqsSize");
        writer.writeInt32(value.prerequisities.size());
        for (ObjectId prereq : value.prerequisities) {

          writer.writeObjectId(prereq);
        }
        writer.writeName("infoSize");
        writer.writeInt32(value.paymentInfo.size());
        for (String item : value.paymentInfo) {
          writer.writeName(item);
          writer.writeString(item);
        }
        writer.writeEndDocument();
      }
    }

    @Override
    public Metadata decode(BsonReader reader, DecoderContext decoderContext) {
      /*
       writer.writeString(value.title);
       writer.writeString(value.description);
       writer.writeString(value.state);
       writer.writeString(value.county);
       writer.writeInt32(value.numLines);
       writer.writeDateTime(value.lastRevisionDate.getTime());
       writer.writeInt32(value.prerequisities.size());
       for (ObjectId prereq : value.prerequisities) {
         writer.writeObjectId(prereq);
       }
       writer.writeInt32(value.paymentInfo.size());
       for (String item : value.paymentInfo) {
         writer.writeString(item);
       }
      */
      reader.readStartDocument();
      reader.readName();
      String title = reader.readString();
      reader.readName();
      String description = reader.readString();
      reader.readName();
      String state = reader.readString();
      reader.readName();
      String county = reader.readString();
      reader.readName();
      int numLines = reader.readInt32();
      reader.readName();
      Date lastRevisionDate = new Date(reader.readDateTime());
      reader.readName();
      int prereqsSize = reader.readInt32();
      Set<ObjectId> prerequisities = new TreeSet<>();
      for (int i = 0; i < prereqsSize; i++) {
        prerequisities.add(reader.readObjectId());
      }
      reader.readName();
      int paymentInfoSize = reader.readInt32();
      List<String> paymentInfo = new ArrayList<>();
      for (int i = 0; i < paymentInfoSize; i++) {
        reader.readName();
        paymentInfo.add(reader.readString());
      }
      reader.readEndDocument();
      return new Metadata(
          title,
          description,
          state,
          county,
          prerequisities,
          lastRevisionDate,
          paymentInfo,
          numLines);
    }

    @Override
    public Class<Metadata> getEncoderClass() {
      return Metadata.class;
    }
  }

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
        Set<ObjectId> prerequisites,
        Date lastRevisionDate,
        List<String> paymentInfo,
        int numLines) {
      this.title = title;
      this.description = description;
      this.state = state;
      this.county = county;
      this.prerequisities = prerequisites;
      this.lastRevisionDate = lastRevisionDate;
      this.numLines = numLines;
      this.paymentInfo = paymentInfo;
    }

    @Override
    public boolean equals(Object obj) {
      if (obj == null) {
        return false;
      }
      if (obj.getClass() != this.getClass()) {
        return false;
      }

      final Metadata other = (Metadata) obj;

      if (!this.title.equals(other.title)) {
        return false;
      }

      if (!this.description.equals(other.description)) {
        return false;
      }
      if (this.lastRevisionDate.getTime() != (other.lastRevisionDate.getTime())) {
        return false;
      }
      if (this.numLines != other.numLines) return false;

      if (!this.paymentInfo.equals(other.paymentInfo)) {
        return false;
      }
      if (!this.prerequisities.equals(other.prerequisities)) {
        return false;
      }

      return true;
    }
  }

  public static class SectionCodec implements Codec<Section> {
    @Override
    public void encode(BsonWriter writer, Section value, EncoderContext encoderContext) {
      if (value != null) {
        writer.writeStartDocument();
        writer.writeName("title");
        writer.writeString(value.title);
        writer.writeName("description");
        writer.writeString(value.description);
        writer.writeName("sectionsSize");
        writer.writeInt32(value.subsections.size());
        for (Section sec : value.subsections) {
          writer.writeName(sec.title);
          encode(writer, sec, encoderContext);
        }
        writer.writeName("questionsSize");
        writer.writeInt32(value.questions.size());
        for (Question question : value.questions) {
          writer.writeName("text");
          writer.writeString(question.questionText);
          writer.writeName("default");
          writer.writeString(question.defaultValue);
          writer.writeName("conditionalOnField");
          writer.writeObjectId(question.conditionalOnField);
          writer.writeName("id");
          writer.writeObjectId(question.id);
          writer.writeName("required");
          writer.writeBoolean(question.required);
          writer.writeName("matched");
          writer.writeBoolean(question.matched);
          writer.writeName("conditionalType");
          writer.writeBoolean(question.conditionalType);
          writer.writeName("type");
          writer.writeString(question.type.toString());
          writer.writeName("numLines");
          writer.writeInt32(question.numLines);
          writer.writeName("optionsSize");
          writer.writeInt32(question.options.size());
          for (String option : question.options) {
            writer.writeName(option);
            writer.writeString(option);
          }
        }
        writer.writeEndDocument();
      }
    }

    @Override
    public Section decode(BsonReader reader, DecoderContext decoderContext) {
      reader.readStartDocument();
      reader.readName();
      String title = reader.readString();
      reader.readName();
      String description = reader.readString();
      reader.readName();
      int SectionsSize = reader.readInt32();
      List<Section> sections = new ArrayList<>();
      for (int i = 0; i < SectionsSize; i++) {
        reader.readName();
        sections.add(decode(reader, decoderContext));
      }
      reader.readName();
      int questionsSize = reader.readInt32();
      reader.readEndDocument();
      List<Question> questions = new ArrayList<>();
      for (int i = 0; i < questionsSize; i++) {
        /*
         writer.writeName("optionsSize");
         writer.writeInt32(question.options.size());
         for (String option : question.options) {
           writer.writeName(option);
           writer.writeString(option);
         }
        */
        reader.readName();
        String questiontext = reader.readString();
        reader.readName();
        String defaultValue = reader.readString();
        reader.readName();
        ObjectId conditionalOnField = reader.readObjectId();
        reader.readName();
        ObjectId id = reader.readObjectId();
        reader.readName();
        boolean required = reader.readBoolean();
        reader.readName();
        boolean matched = reader.readBoolean();
        reader.readName();
        boolean conditionalType = reader.readBoolean();
        reader.readName();
        FieldType type = FieldType.valueOf(reader.readString());
        reader.readName();
        int numLines = reader.readInt32();
        reader.readName();
        int optionsSize = reader.readInt32();
        List<String> options = new ArrayList<>();
        for (int j = 0; j < optionsSize; j++) {
          reader.readName();
          options.add(reader.readString());
        }
        Question q =
            new Question(
                id,
                type,
                questiontext,
                options,
                defaultValue,
                required,
                numLines,
                matched,
                conditionalOnField,
                conditionalType);
        questions.add(q);
      }
      return new Section(title, description, sections, questions);
    }

    @Override
    public Class<Section> getEncoderClass() {
      return Section.class;
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

    @Override
    public boolean equals(Object obj) {
      if (obj == null) {
        return false;
      }
      if (obj.getClass() != this.getClass()) {
        return false;
      }

      final Section other = (Section) obj;

      if (!this.title.equals(other.title)) {
        return false;
      }

      if (!this.description.equals(other.description)) {
        return false;
      }

      if (!this.subsections.equals(other.subsections)) {
        return false;
      }
      if (this.questions == null || !this.questions.equals(other.questions)) {
        return false;
      }
      return true;
    }
  }

  public static class Question {
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

    @Override
    public boolean equals(Object obj) {
      if (obj == null) {
        return false;
      }
      if (obj.getClass() != this.getClass()) {
        return false;
      }

      final Question other = (Question) obj;

      if (!this.id.equals(other.id)) {
        return false;
      }

      if (!this.type.equals(other.type)) {
        return false;
      }

      if (!this.questionText.equals(other.questionText)) {
        return false;
      }

      if (!this.options.equals(other.options)) {
        return false;
      }

      if (!this.defaultValue.equals(other.defaultValue)) {
        return false;
      }

      if (this.numLines != (other.numLines)) {
        return false;
      }

      if (this.matched != (other.matched)) {
        return false;
      }

      if (this.conditionalType != (other.conditionalType)) {
        return false;
      }

      if (!this.conditionalOnField.equals(other.conditionalOnField)) {
        return false;
      }
      return true;
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

  public void setFormType(FormType formType) {
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
