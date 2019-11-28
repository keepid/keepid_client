package User;

public enum UserMessage {
    AUTH_SUCCESS("AUTH_SUCCESS:Successfully Authenticated User"),
    ENROLL_SUCCESS("ENROLL_SUCCESS:Successfully enrolled User."),
    AUTH_FAILURE("AUTH_FAILURE:Wrong Credentials"),
    HASH_FAILURE("HASH_FAILURE:Check Argon2 documentation"),
    USER_NOT_FOUND("USER_NOT_FOUND:User does not exist in database."),
    SESSION_TOKEN_FAILURE("SESSION_TOKEN_FAILURE:Session tokens are null."),
    DIFFERENT_ORGANIZATION("DIFFERENT_ORGANIZATION:Cannot enroll someone in an organization different from your own."),
    NONADMIN_ENROLL_ADMIN("NONDMIN_ENROLL_AADMIN:A Non-Admin cannot enroll an admin."),
    NONADMIN_ENROLL_WORKER("NONADMIN_ENROLL_WORKER:A non-admin cannot enroll a worker."),
    CLIENT_ENROLL_CLIENT("CLIENT_ENROLL_CLIENT:Only workers or admins can enroll new clients."),
    USERNAME_ALREADY_EXISTS("USERNAME_ALREADY_EXISTS:This username is taken.");

    public String errorMessage;

    UserMessage(String errorMessage){
        this.errorMessage = errorMessage;
    }
    public String toString() {
        return this.errorMessage;
    }

    public String getErrorName(){
        return this.errorMessage.split(":")[0];
    }

    public String getErrorDescription(){
        return this.errorMessage.split(":")[1];
    }
}
