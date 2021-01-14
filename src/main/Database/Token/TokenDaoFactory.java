package Database.Token;

import Config.DeploymentLevel;

public class TokenDaoFactory {
  public static TokenDao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      return new TokenDaoTestImpl(deploymentLevel);
    }
    return new TokenDaoImpl(deploymentLevel);
  }
}
