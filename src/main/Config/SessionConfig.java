package Config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import org.eclipse.jetty.nosql.mongodb.MongoSessionDataStoreFactory;
import org.eclipse.jetty.server.session.DefaultSessionCache;
import org.eclipse.jetty.server.session.FileSessionDataStore;
import org.eclipse.jetty.server.session.SessionCache;
import org.eclipse.jetty.server.session.SessionHandler;

import java.io.File;
import java.util.Objects;

public class SessionConfig {
  private static SessionHandler sessionHandler;

  public static final String MONGO_URI = Objects.requireNonNull(System.getenv("MONGO_URI"));
  public static final String MONGO_DB_TEST = "test-db";
  public static final String MONGO_DB_STAGING = "staging-db";
  public static final String MONGO_DB_PRODUCTION = "production-db";
  public static final String SESSION_DB_NAME_TEST = "session-test";
  public static final String SESSION_DB_NAME_STAGING = "session-staging";
  public static final String SESSION_DB_NAME_PRODUCTION = "session-production";

  public static SessionHandler getSessionHandlerInstance(DeploymentLevel deploymentLevel) throws Exception {
    if (sessionHandler != null) return sessionHandler;
    sessionHandler = new SessionHandler();
    SessionCache sessionCache = new DefaultSessionCache(sessionHandler);
    switch(deploymentLevel) {
      case TEST:
        sessionCache.setSessionDataStore(
                mongoDataStoreFactory(MONGO_DB_TEST, SESSION_DB_NAME_TEST)
                        .getSessionDataStore(sessionHandler));
        break;
      case STAGING:
        sessionCache.setSessionDataStore(
                mongoDataStoreFactory(MONGO_DB_STAGING, SESSION_DB_NAME_STAGING)
                        .getSessionDataStore(sessionHandler));
        break;
      case PRODUCTION:
        sessionCache.setSessionDataStore(
                mongoDataStoreFactory(MONGO_DB_PRODUCTION, SESSION_DB_NAME_PRODUCTION)
                        .getSessionDataStore(sessionHandler));
    }
    sessionHandler.setSessionCache(sessionCache);
    sessionHandler.setHttpOnly(true);
    sessionHandler.setMaxInactiveInterval(60 * 15); // 15 minutes
    return sessionHandler;
  }

  private static MongoSessionDataStoreFactory mongoDataStoreFactory(
      String dbName, String collectionName) {
    MongoSessionDataStoreFactory mongoSessionDataStoreFactory = new MongoSessionDataStoreFactory();
    mongoSessionDataStoreFactory.setConnectionString(MONGO_URI);
    mongoSessionDataStoreFactory.setDbName(dbName);
    mongoSessionDataStoreFactory.setCollectionName(collectionName);
    return mongoSessionDataStoreFactory;
  }
}
