package Bug;

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

public class BugReport {
  private ObjectId id;

  @BsonProperty(value = "bugTitle")
  private String bugTitle;

  @BsonProperty(value = "bugDescription")
  private String bugDescription;

  public BugReport(String bugTitle, String bugDescription) {
    this.bugTitle = bugTitle;
    this.bugDescription = bugDescription;
  }

  public String getBugTitle() {
    return bugTitle;
  }

  public String getBugDescription() {
    return bugDescription;
  }

  public void setBugTitle(String bugTitle) {
    this.bugTitle = bugTitle;
  }

  public void setBugDescription(String bugDescription) {
    this.bugDescription = bugDescription;
  }
}
