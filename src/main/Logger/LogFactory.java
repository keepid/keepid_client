package Logger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;


public class LogFactory {

  Logger appLogger; // default logger
  HashMap<String, Logger> loggers; 

  public LogFactory() {
    loggers = new HashMap<String, Logger>();
    appLogger = LoggerFactory.getLogger("App");
    loggers.put("App", appLogger);
  }

  public Logger createLogger() {
    return appLogger;
  }

  public Logger createLogger(String name) {
    Logger newLogger = LoggerFactory.getLogger(name);
    loggers.put(name, newLogger);
    return newLogger;
  }

  public Logger getLogger(String name) {
    return loggers.get(name);
  }

  // for debugging logs
  public static void main(String[] args) {
    Logger logger = LoggerFactory.getLogger("App");
    logger.debug("Hello world.");

    // print internal state
//    LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
//    StatusPrinter.print(lc);
    logger.warn("PRINT LOGGER HERE WARN");
    logger.error("PRINT LOGGER HERE ERROR");
    logger.debug("PRINT LOGGER HERE DEBUG");
  }
}
