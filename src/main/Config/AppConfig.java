package Config;

import io.javalin.Javalin;

public class AppConfig {
  public static Long ASYNC_TIME_OUT = 10L;

  public static Javalin createJavalinApp() {
    return Javalin.create(
        config -> {
          config.asyncRequestTimeout =
              ASYNC_TIME_OUT; // timeout for async requests (default is 0, no timeout)
          config.autogenerateEtags = false; // auto generate etags (default is false)

          config.contextPath = "/"; // context path for the http servlet (default is "/")
          config.defaultContentType =
              "text/plain"; // content type to use if no content type is set (default is
          // "text/plain")
          config.enableCorsForAllOrigins(); // enable cors for all origins
          config.enableDevLogging(); // enable extensive development logging for http and
          // websocket
          config.enforceSsl =
              false; // redirect http traffic to https (default is false) -- setting to true
          // breaks our code for now
          config.logIfServerNotStarted =
              true; // log a warning if user doesn't start javalin instance (default is
          // true)
          config.prefer405over404 =
              false; // send a 405 if handlers exist for different verb on the same path
          // (default is false)
          config.sessionHandler(
              () -> {
                try {
                  return SessionConfig.getSessionHandlerInstance();
                } catch (Exception e) {
                  System.err.println("Unable to instantiate session handler.");
                  e.printStackTrace();
                  System.exit(1);
                  return null;
                }
              });
        });
  }
}
