package User.V2;

import lombok.*;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Address {

  @NonNull String address1;
  String address2;
  @NonNull String city;
  @NonNull String state;
  @NonNull String zip;
}
