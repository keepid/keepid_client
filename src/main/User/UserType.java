package User;

public enum UserType {
  Director,
  Admin,
  Worker,
  Client,
  Developer;

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
      case "developer":
        return Developer;
      default:
        return null;
    }
  }
}
