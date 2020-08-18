import Bug.BugController;
import Config.AppConfig;
import Config.DeploymentLevel;
import Config.MongoConfig;
import Logger.LogFactory;
import Organization.OrganizationController;
import PDF.PdfController;
import Security.AccountSecurityController;
import Security.EmailUtil;
import Security.SecurityUtils;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import org.slf4j.Logger;

public class App {
  public static void main(String[] args) {
    AppConfig.appFactory(DeploymentLevel.STAGING);
  }
}
