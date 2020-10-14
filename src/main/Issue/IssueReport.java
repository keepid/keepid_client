package Issue;

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

public class IssueReport {
  private ObjectId id;

  @BsonProperty(value = "issueTitle")
  private String issueTitle;

  @BsonProperty(value = "issueDescription")
  private String issueDescription;

  public IssueReport() {}

  public IssueReport(String issueTitle, String issueDescription) {
    this.issueTitle = issueTitle;
    this.issueDescription = issueDescription;
  }

  public String getIssueTitle() {
    return issueTitle;
  }

  public String getIssueDescription() {
    return issueDescription;
  }

  public void setIssueTitle(String issueTitle) {
    this.issueTitle = issueTitle;
  }

  public void setIssueDescription(String issueDescription) {
    this.issueDescription = issueDescription;
  }
}
