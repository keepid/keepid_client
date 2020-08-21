package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public abstract class Activity {
  private ObjectId id;

  @BsonProperty(value = "occuredAt")
  private LocalDateTime occurredAt;

  @BsonProperty(value = "owner")
  private User owner;

  @BsonProperty(value = "type")
  private List<String> type;

  public Activity() {
    this.type = construct();
  }

  Activity(User owner) {
    this.owner = owner;
    this.occurredAt = LocalDateTime.now();
    this.type = construct();
  }

  List<String> construct() {
    return Collections.emptyList();
  }

  public List<String> getType() {
    return type;
  }

  public void setType(List<String> type) {
    this.type = type;
  }

  public LocalDateTime getOccurredAt() {
    return occurredAt;
  }

  public void setOccurredAt(LocalDateTime occurredAt) {
    this.occurredAt = occurredAt;
  }

  public User getOwner() {
    return owner;
  }

  public void setOwner(User owner) {
    this.owner = owner;
  }
}
