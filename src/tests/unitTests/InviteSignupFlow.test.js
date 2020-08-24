import {birthDateStringConverter} from "../../components/SignUp/InviteSignupFlow";

test('birth date string converter test',() => {
	expect(birthDateStringConverter("01-16-1998")).toBe("01-16-1998");
	expect(birthDateStringConverter("2-6-1998")).toBe("02-06-1998");
	expect(birthDateStringConverter("5-12-80")).toBe("05-12-1980");
})