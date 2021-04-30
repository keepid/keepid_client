package User.V2;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Person {
  private String firstName;
  private String lastName;
  private Date birthDate;
  private String ssn;
  private String maidenName;
}
