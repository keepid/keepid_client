package Security;

import io.javalin.http.Context;
import javax.servlet.http.HttpServletRequest;

public interface GeneralValidator {

    static boolean isValid(HttpServletRequest req, Context ctx) {
        return false;
    }
}
