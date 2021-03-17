import faker from 'faker';

export const fakeUser = () => ({
  username: faker.internet.userName(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  birthDate: '1990-01-01',
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  city: faker.address.city(),
  state: faker.address.state(),
  address: faker.address.streetAddress(),
  zipcode: faker.address.zipCode(),
  twoFactorOn: false,
});

export const fakeOrg = () => ({
  orgName: faker.internet.userName(),
  website: faker.internet.domainName(),
  city: faker.address.city(),
  state: faker.address.state(),
  address: faker.address.streetAddress(),
  zipcode: faker.address.zipCode(),
  creationDate: faker.date.past(),
});
