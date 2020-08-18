import Config.AppConfig;
import Config.DeploymentLevel;

public class ProductionApp {
  public static void main(String[] args) {
    AppConfig.appFactory(DeploymentLevel.PRODUCTION);
  }
}
