package User;

public enum UserType {
  Director,
  Admin,
  Worker,
  Client;

  public static UserType userTypeFromString(String s) {
    s = s.toLowerCase();
    switch (s) {
      case "director":
        return Director;
      case "admin":
        return Admin;
      case "worker":
        return Worker;
      case "client":
        return Client;
      default:
        return null;
    }
  }
}
