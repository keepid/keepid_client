package User.V2;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import org.bson.types.ObjectId;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class BaseUser {

  private ObjectId id;
  private Person self;
  private String password;
  private BasicInfo basicInfo;
  private DemographicInfo demographicInfo;
  private FamilyInfo familyInfo;
  private VeteranStatus veteranStatus;

  @JsonIgnore
  public Map<String, Object> getBaseUser() {
    Map<String, Object> result = new HashMap<>();
    if (self != null) {
      result.put("firstName", self.getFirstName());
      result.put("lastName", self.getLastName());
      result.put("birthDate", self.getBirthDate());
    }
    return result;
  }

  @JsonIgnore
  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(this, new TypeReference<>() {});
  }

  @JsonIgnore
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
