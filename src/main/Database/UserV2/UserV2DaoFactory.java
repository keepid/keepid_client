package Database.UserV2;

import Config.DeploymentLevel;

public class UserV2DaoFactory {
  public static UserV2Dao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException();
    }
    return new UserV2DaoImpl(deploymentLevel);
  }
}
