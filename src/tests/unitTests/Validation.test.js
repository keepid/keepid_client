// import Validations from '../../lib/Validations/Validations';
import {isValidAddress, isValidBirthDate, isValidCity, isValidEmail, isValidOrgWebsite,
    isValidPhoneNumber, isValidUSState, isValidZipCode, isValidUsername, isValidPassword,
    isValidOrgName, isValidEIN, isValidFirstName, isValidLastName} from '../../lib/Validations/Validations';

test('valid website test',() => {
    expect(isValidOrgWebsite("https://example.com")).toBe(true);
    expect(isValidOrgWebsite("https://www.example.com")).toBe(true);
    expect(isValidOrgWebsite("https://www.example.org/somethinghere")).toBe(true);
    expect(isValidOrgWebsite("")).toBe(false);
    expect(isValidOrgWebsite("not_localhost")).toBe(false);
    expect(isValidOrgWebsite("not a website")).toBe(false);
    expect(isValidOrgWebsite("111.22.1.2")).toBe(false);
    expect(isValidOrgWebsite("    ")).toBe(false);
    expect(isValidOrgWebsite(null)).toBe(false);
})
 
test('valid email test', () => {
    expect(isValidEmail("myemail@email.com")).toBe(true);
    expect(isValidEmail("anotherExample@gmail.com")).toBe(true);
    expect(isValidEmail("12345@email.org")).toBe(true);
    expect(isValidEmail("<script>")).toBe(false);
    expect(isValidEmail("notValidEmail.org")).toBe(false);
    expect(isValidEmail("email@")).toBe(false);
    expect(isValidEmail("    ")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
})
 
test('valid phone number test', () => {
    expect(isValidPhoneNumber("6305264087")).toBe(true);
    expect(isValidPhoneNumber("(630)111-1111")).toBe(true);
    expect(isValidPhoneNumber("123-456-7890")).toBe(true);
    expect(isValidPhoneNumber("1-630-526-4047")).toBe(true);
    expect(isValidPhoneNumber("(1)-(410)-302-2342")).toBe(true);
    expect(isValidPhoneNumber("(267)-234-2342")).toBe(true);
    expect(isValidPhoneNumber("(123)456-7890")).toBe(true);
    expect(isValidPhoneNumber("(123)4567890")).toBe(true);
    expect(isValidPhoneNumber("notValidPhoneNumber")).toBe(false);
    expect(isValidPhoneNumber("222222222222222222")).toBe(false);
    expect(isValidPhoneNumber("222")).toBe(false);
    expect(isValidPhoneNumber("    ")).toBe(false);
    expect(isValidPhoneNumber("")).toBe(false);
    expect(isValidPhoneNumber(null)).toBe(false);

})
 
test('valid zip code test', () => {
    expect(isValidZipCode("60563")).toBe(true);
    expect(isValidZipCode("19104")).toBe(true);
    expect(isValidZipCode("12345-6789")).toBe(true);
    expect(isValidZipCode("1-6789")).toBe(false);
    expect(isValidZipCode("hello")).toBe(false);
    expect(isValidZipCode("<script>")).toBe(false);
    expect(isValidZipCode("    ")).toBe(false);
    expect(isValidZipCode("")).toBe(false);
    expect(isValidZipCode(null)).toBe(false);
})
 
test('valid us state test', () => {
    expect(isValidUSState("IL")).toBe(true);
    expect(isValidUSState("PA")).toBe(true);
    expect(isValidUSState("MO")).toBe(true);
    expect(isValidUSState("OR")).toBe(true);
    expect(isValidUSState("WA")).toBe(true);
    expect(isValidUSState("1-6789")).toBe(false);
    expect(isValidUSState("XJ")).toBe(false);
    expect(isValidUSState("<script>")).toBe(false);
    expect(isValidUSState("    ")).toBe(false);
    expect(isValidUSState("")).toBe(false);
    expect(isValidUSState(null)).toBe(false);

})
 
test('valid city test', () => {
    expect(isValidCity("Philadelphia")).toBe(true);
    expect(isValidCity("Chicago")).toBe(true);
    expect(isValidCity("St. Paul - Minneapolis")).toBe(true);
    expect(isValidCity("Bird - in - hand")).toBe(true);
    expect(isValidCity("Cøpenhagen")).toBe(true);
    expect(isValidCity("High.")).toBe(true);
    expect(isValidCity("123 street")).toBe(false);
    expect(isValidCity(" ")).toBe(false);
    expect(isValidCity(null)).toBe(false);
})

test('valid street address test', () => {
    expect(isValidAddress("Here")).toBe(true);
    expect(isValidAddress("Baptist Church")).toBe(true);
    expect(isValidAddress("123 Market, Apt. S3")).toBe(true);
    expect(isValidAddress("#")).toBe(false);
    expect(isValidAddress("Text #")).toBe(false);
    expect(isValidAddress("123,   {")).toBe(false);
    expect(isValidAddress("hullo#")).toBe(false);
    expect(isValidAddress(" ")).toBe(false);
    expect(isValidAddress(null)).toBe(false);
})

test('valid birthdate test', () => {
    expect(isValidBirthDate("12-23-1234")).toBe(true);
    expect(isValidBirthDate("03-23-2000")).toBe(true);
    expect(isValidBirthDate("10-01-2019")).toBe(true);
    expect(isValidBirthDate("10-01-2029")).toBe(false);
    expect(isValidBirthDate("123-10-1010")).toBe(false);
    expect(isValidBirthDate("12-123-1233")).toBe(false);
    expect(isValidBirthDate("12-01-2012as")).toBe(false);
    expect(isValidBirthDate("hullo")).toBe(false);
    expect(isValidBirthDate(" ")).toBe(false);
    expect(isValidBirthDate(null)).toBe(false);
})

test('valid username test', () => {
    expect(isValidUsername("samuel")).toBe(true);
    expect(isValidUsername("JoeHi")).toBe(true);
    expect(isValidUsername("KAYLA-REMMINGTON12")).toBe(true);
    expect(isValidUsername("/")).toBe(false);
    expect(isValidUsername("S#Rena")).toBe(false);
    expect(isValidUsername("123 Test")).toBe(false);
    expect(isValidUsername("1234%")).toBe(false);
    expect(isValidUsername(" ")).toBe(false);
    expect(isValidUsername(null)).toBe(false);
})

test('valid password test', () => {
    expect(isValidPassword("thispasswordissufficientlylong")).toBe(true);
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("123Passwordasdkjfhasdkfhafhjask.dfjhasdfjlasdkjfhaslkdjfh*()")).toBe(true);
    expect(isValidPassword("asd\\")).toBe(false);
    expect(isValidPassword("asdkll/")).toBe(false);
    expect(isValidPassword("aslf;")).toBe(false);
    expect(isValidPassword("thisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpassword")).toBe(false);
    expect(isValidPassword(" ")).toBe(false);
    expect(isValidPassword(null)).toBe(false);
})

test('valid name test', () => {
    expect(isValidFirstName("valid name here")).toBe(true);
    expect(isValidFirstName("Bob")).toBe(true);
    expect(isValidFirstName("O'Neal")).toBe(true);
    expect(isValidFirstName("invalid name 123")).toBe(false);
    expect(isValidFirstName("<script>hello</script>")).toBe(false);
    expect(isValidFirstName("    ")).toBe(false);
    expect(isValidFirstName("")).toBe(false);
    expect(isValidFirstName(null)).toBe(false);

    expect(isValidLastName("valid name here")).toBe(true);
    expect(isValidLastName("Bob")).toBe(true);
    expect(isValidLastName("O'Neal")).toBe(true);
    expect(isValidLastName("invalid name 123")).toBe(false);
    expect(isValidLastName("<script>hello</script>")).toBe(false);
    expect(isValidLastName("    ")).toBe(false);
    expect(isValidLastName("")).toBe(false);
    expect(isValidLastName(null)).toBe(false);

    expect(isValidOrgName("valid name here")).toBe(true);
    expect(isValidOrgName("Bob")).toBe(true);
    expect(isValidOrgName("O'Neal")).toBe(true);
    expect(isValidOrgName("Valid name 123")).toBe(true);
    expect(isValidOrgName("<script>hello</script>")).toBe(false);
    expect(isValidOrgName("    ")).toBe(false);
    expect(isValidOrgName("")).toBe(false);
    expect(isValidOrgName(null)).toBe(false);
})

test('valid EIN test', () => {
    expect(isValidEIN("12-1234567")).toBe(true);
    expect(isValidEIN("42-1231244")).toBe(true);
    expect(isValidEIN("01-2345678")).toBe(true);
    expect(isValidEIN("561234567")).toBe(true);
    expect(isValidEIN("1-1232345")).toBe(false);
    expect(isValidEIN(null)).toBe(false);
    expect(isValidEIN("12-1")).toBe(false);
    expect(isValidEIN(" ")).toBe(false);
    expect(isValidEIN("794-35344534")).toBe(false);
    expect(isValidEIN("jsa")).toBe(false);
})