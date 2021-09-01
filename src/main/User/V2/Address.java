package User.V2;

import lombok.*;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Address {

  @NonNull String streetAddress;
  String apartmentNumber;
  @NonNull String city;
  @NonNull String state;
  @NonNull String zip;
}
