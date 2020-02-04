package Config;

import io.github.cdimascio.dotenv.Dotenv;

public class Env {
  private static Dotenv dotenv;

  public static Dotenv getInstance() {
    if (dotenv == null) {
      dotenv = Dotenv.configure().ignoreIfMissing().directory("./").load();
    }
    return dotenv;
  }
}
