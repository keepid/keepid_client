package User.V2;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class BaseUser {

  private String username;
  private String firstName;
  private String lastName;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy")
  private Date birthDate;

  private String password;
  private BasicInfo basicInfo;
  private DemographicInfo demographicInfo;
  private FamilyInfo familyInfo;
  private VeteranStatus veteranStatus;

  public String getUsername() {
    return (null == username) ? (firstName + lastName) : username;
  }

  @JsonIgnore
  public Map<String, Object> getBaseUser() {
    Map<String, Object> result = new HashMap<>();
    result.put("username", getUsername());
    result.put("firstName", getFirstName());
    result.put("lastName", getLastName());
    result.put("birthDate", getBirthDate());
    return result;
  }

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(this, new TypeReference<>() {});
  }

  public Map<String, Object> getFromString(String key) {
    try {
      switch (key) {
        case "Basic":
          return basicInfo.toMap();
        case "Demographic":
          return demographicInfo.toMap();
        case "Family":
          return familyInfo.toMap();
        case "Veteran":
          return veteranStatus.toMap();
        default:
          return null;
      }
    } catch (Exception e) {
      return null;
    }
  }
}
