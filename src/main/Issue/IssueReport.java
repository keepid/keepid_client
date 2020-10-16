package Issue;

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

public class IssueReport {
  private ObjectId id;

  @BsonProperty(value = "issueTitle")
  private String issueTitle;

  @BsonProperty(value = "issueDescription")
  private String issueDescription;

  @BsonProperty(value = "issueEmail")
  private String issueEmail;

  public IssueReport() {}

  public IssueReport(String issueTitle, String issueDescription, String issueEmail) {
    this.issueTitle = issueTitle;
    this.issueDescription = issueDescription;
    this.issueEmail = issueEmail;
  }

  public String getIssueTitle() {
    return issueTitle;
  }

  public String getIssueDescription() {
    return issueDescription;
  }

  public String getIssueEmail() {
    return issueEmail;
  }

  public void setIssueTitle(String issueTitle) {
    this.issueTitle = issueTitle;
  }

  public void setIssueDescription(String issueDescription) {
    this.issueDescription = issueDescription;
  }

  public void setIssueEmail(String issueEmail) {
    this.issueEmail = issueEmail;
  }
}
