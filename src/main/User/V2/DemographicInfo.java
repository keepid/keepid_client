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
  // false is Non-Hispanic/Latino, true is Hispanic/Latino
  @NonNull private Boolean ethnicity;
  @NonNull private Race race;
  @NonNull private String cityOfBirth;
  @NonNull private String stateOfBirth;
  @NonNull private String countryOfBirth;
  @NonNull private Citizenship americanCitizen;

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(this, new TypeReference<>() {});
  }
}
