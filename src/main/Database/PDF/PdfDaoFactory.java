package Database.PDF;

import Config.DeploymentLevel;

public class PdfDaoFactory {
  public static PdfDao create(DeploymentLevel deploymentLevel) {
    if (deploymentLevel == DeploymentLevel.IN_MEMORY) {
      return new PdfDaoTestImpl(deploymentLevel);
    }
    return new PdfDaoImpl(deploymentLevel);
  }
}
