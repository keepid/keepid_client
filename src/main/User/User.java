package User;

public class User {
    String username;
    String organization;
    String email;
    String name;
    String privelegeLevel;

    public User(String username, String organization, String email, String name, String privelegeLevel) {
        this.username = username;
        this.organization = organization;
        this.email = email;
        this.name = name;
        this.privelegeLevel = privelegeLevel;
    }
}
