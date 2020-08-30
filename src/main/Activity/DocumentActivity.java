package Activity;

import PDF.PDFType;
import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.ArrayList;
import java.util.List;

public class DocumentActivity extends UserActivity {
  @BsonProperty(value = "documentOwner")
  private User documentOwner;

  @BsonProperty(value = "documentType")
  private PDFType documentType;

  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(DocumentActivity.class.getSimpleName());
    return a;
  }

  public DocumentActivity() {}

  public DocumentActivity(User user) {
    super(user);
  }
}
