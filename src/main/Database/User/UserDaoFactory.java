package Database.User;

import Config.DeploymentLevel;

public class UserDaoFactory {
  public static UserDao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      return new UserDaoTestImpl(deploymentLevel);
    }
    return new UserDaoImpl(deploymentLevel);
  }
}
