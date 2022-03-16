package Database.Form;

import Config.DeploymentLevel;

public class FormDaoFactory {
  public static FormDao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      return new FormDaoTestImpl(deploymentLevel);
    }
    return new FormDaoImpl(deploymentLevel);
  }
}
