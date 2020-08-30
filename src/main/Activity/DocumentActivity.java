package Activity;

import PDF.PDFType;
import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;

public class DocumentActivity extends UserActivity {
  @BsonProperty(value = "documentOwner")
  private User documentOwner;

  @BsonProperty(value = "documentType")
  private String documentType;

  @BsonProperty(value = "documentID")
  private ObjectId documentID;

  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(DocumentActivity.class.getSimpleName());
    return a;
  }

  public DocumentActivity() {}

  public DocumentActivity(
      User user, User documentOwner, PDFType documentType, ObjectId documentID) {
    super(user);
    this.documentOwner = documentOwner;
    this.documentType = documentType.toString();
    this.documentID = documentID;
  }

  public String getDocumentType() {
    return documentType;
  }

  public void setDocumentType(String documentType) {
    this.documentType = documentType;
  }

  public User getDocumentOwner() {
    return documentOwner;
  }

  public void setDocumentOwner(User documentOwner) {
    this.documentOwner = documentOwner;
  }

  public ObjectId getDocumentID() {
    return documentID;
  }

  public void setDocumentID(ObjectId documentID) {
    this.documentID = documentID;
  }
}
