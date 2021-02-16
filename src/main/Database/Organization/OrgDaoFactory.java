package Database.Organization;

import Config.DeploymentLevel;

public class OrgDaoFactory {
  public static OrgDao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      return new OrgDaoTestImpl(deploymentLevel);
    }
    return new OrgDaoImpl(deploymentLevel);
  }
}
