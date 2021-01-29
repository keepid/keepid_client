package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Activity {
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
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    return a;
  }

  public List<String> getType() {
    return type;
  }

  public Activity setType(List<String> type) {
    this.type = type;
    return this;
  }

  public LocalDateTime getOccurredAt() {
    return occurredAt;
  }

  public Activity setOccurredAt(LocalDateTime occurredAt) {
    this.occurredAt = occurredAt;
    return this;
  }

  public User getOwner() {
    return owner;
  }

  public Activity setOwner(User owner) {
    this.owner = owner;
    return this;
  }
}
