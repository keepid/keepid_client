package Organization;
import java.io.IOException;
import java.util.regex.Pattern;

import Regex.ValRegex;
import Logger.Log;

public class OrganizationValidation {
	protected static OrgEnrollmentStatus valOrg(String fn, String ln, String email, String password, String org) throws SecurityException, IOException{
		Log l = new Log();
        //First Name
        if (fn == null || fn.strip().length() == 0) {
        	l.logger.warning("First Name Empty");
        	return OrgEnrollmentStatus.FIELD_EMPTY;
        }       
        if (fn.length() > 31) {
        	l.logger.warning("First Name Inappropriate Length " + fn.length());
        	return OrgEnrollmentStatus.NAME_LEN_OVER_30;
        }
        if (!Pattern.matches(ValRegex.name, fn)) {
        	l.logger.warning("Invalid Characters used In First Name"); //Should I include
        	return OrgEnrollmentStatus.INVALID_CHARACTERS_FN;
        }

        //Last Name
        if (ln == null || ln.strip().length() == 0) {
        	l.logger.warning("Last Name Empty");	
        	return OrgEnrollmentStatus.FIELD_EMPTY;
        }
        if (ln.length() > 31) {
        	l.logger.warning("Last Name Inappropriate Length " + fn.length());
        	return OrgEnrollmentStatus.NAME_LEN_OVER_30;
        }
        if (!Pattern.matches(ValRegex.name, ln)) {
        	l.logger.warning("Invalid Characters Used In Last Name"); //Should I include
        	return OrgEnrollmentStatus.INVALID_CHARACTERS_LN;
        }
        
        //Email
        if (email == null || email.strip().length() == 0) {
        	l.logger.warning("Email Empty");
            return OrgEnrollmentStatus.FIELD_EMPTY;
        }
        if (email.length() > 40) {
        	l.logger.warning("Email Is Too Long " + email.length());
        	return OrgEnrollmentStatus.EMAIL_LEN_OVER_40;
        }
        if (!Pattern.matches(ValRegex.email, email)) {
        	l.logger.warning("Email Uses Invalid Characters");  
        	return OrgEnrollmentStatus.INVALID_CHARACTERS_E;
        }
        
        //Password
        if (password == null || password.strip().length() == 0) {
        	l.logger.warning("Password Empty");
        	return OrgEnrollmentStatus.FIELD_EMPTY;
        }
        if (password.length() < 8) {
        	l.logger.warning("Password is less than 7 characters");
        	return OrgEnrollmentStatus.PASS_UNDER_8;
        }
        
        //Organization Name
        if (org == null || org.strip().length() == 0) {
        	l.logger.warning("Organization is Empty");
        	return OrgEnrollmentStatus.FIELD_EMPTY;
        }
        if (!Pattern.matches(ValRegex.org, org)) {
            l.logger.warning("Organization Name Contains Invalid Characters");
            return OrgEnrollmentStatus.INVALID_CHARACTERS_ORG;
        }
        return OrgEnrollmentStatus.VALID;
    }
}
