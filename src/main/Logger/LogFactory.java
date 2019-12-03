package Logger;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.core.util.StatusPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LogFactory {

  Logger logger;

  public LogFactory() {
    logger = LoggerFactory.getLogger("App");
  }

  public Logger createLogger() {
    return logger;
  }

  // for debugging logs
  public static void main(String[] args) {
    Logger logger = LoggerFactory.getLogger("App");
    logger.debug("Hello world.");

    // print internal state
    LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
    StatusPrinter.print(lc);
    logger.warn("PRINT LOGGER HERE WARN");
    logger.error("PRINT LOGGER HERE ERROR");
    logger.debug("PRINT LOGGER HERE DEBUG");
  }
}
