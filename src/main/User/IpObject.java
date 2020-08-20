package User;

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

public class IpObject {
  private ObjectId id;

  @BsonProperty(value = "ip")
  private String ip;

  @BsonProperty(value = "location")
  private String location;

  @BsonProperty(value = "date")
  private String date;

  @BsonProperty(value = "device")
  private String device;

  public IpObject() {}

  public String getDevice() {
    return device;
  }

  public void setDevice(String device) {
    this.device = device;
  }

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getIp() {
    return ip;
  }

  public void setIp(String ip) {
    this.ip = ip;
  }
}
