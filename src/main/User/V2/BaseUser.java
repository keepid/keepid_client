package User.V2;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import org.jetbrains.annotations.NotNull;

import java.util.Date;
import java.util.Map;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class BaseUser {

  private String username;
  @NonNull private String firstName;
  @NonNull private String lastName;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy")
  @NotNull
  private Date birthDate;

  @NotNull private String password;
  private BasicInfo basicInfo;
  private DemographicInfo demographicInfo;
  private FamilyInfo familyInfo;
  private VeteranStatus veteranStatus;

  public String getUsername() {
    return (null == username) ? (firstName + lastName) : username;
  }

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(this, new TypeReference<>() {});
  }
}
