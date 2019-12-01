package User;

public class User {

    String username;
    String organization;
    String email;
    String name;
    String privilegeLevel;

    public User(String username, String organization, String email, String name,
        String privilegeLevel) {
        this.username = username;
        this.organization = organization;
        this.email = email;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
    }
}
