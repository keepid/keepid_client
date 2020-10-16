import Config.AppConfig;
import Config.DeploymentLevel;

public class App {
  public static void main(String[] args) {
    AppConfig.appFactory(DeploymentLevel.STAGING);
  }
}
