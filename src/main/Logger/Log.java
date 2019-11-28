package Logger;
import java.util.logging.*;
import java.io.File;
import java.io.IOException;
public class Log {
	static final String dst = "log.txt";
	public Logger logger;
	FileHandler fh;
	public Log() throws SecurityException, IOException {
		File f = new File(dst);
		if (!f.exists()) {
			f.createNewFile();
		}
		fh = new FileHandler(dst, true);
		logger.addHandler(fh);
		SimpleFormatter formatter = new SimpleFormatter();
		fh.setFormatter(formatter);
	}	
}
