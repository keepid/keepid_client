package Activity;

import PDF.PDFType;
import User.User;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;

public class UploadActivity extends DocumentActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(DocumentActivity.class.getSimpleName());
    a.add(UploadActivity.class.getSimpleName());
    return a;
  }

  public UploadActivity() {
    super();
  }

  public UploadActivity(User owner, User created, PDFType pdfType, ObjectId id) {
    super(owner, created, pdfType, id);
  }
}
