import {birthDateStringConverter} from "../../components/SignUp/InviteSignupFlow";

let dateTest1 = new Date(1998,1,16);
let dateTest2 = new Date(1990,2,6);
let dateTest3 = new Date(98,5,12);

test('birth date string converter test',() => {
	expect(birthDateStringConverter(dateTest1)).toBe("01-16-1998");
	expect(birthDateStringConverter(dateTest2)).toBe("02-06-1998");
	expect(birthDateStringConverter(dateTest3)).toBe("05-12-1980");
})