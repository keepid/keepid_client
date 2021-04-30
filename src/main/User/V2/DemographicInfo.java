package User.V2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class DemographicInfo {
  private String languagePreference;
  private String ethnicity;
  private String race;
  private String cityOfBirth;
  private String stateOfBirth;
  private String countryOfBirth;
  private boolean americanCitizen;

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(this, new TypeReference<>() {});
  }
}
