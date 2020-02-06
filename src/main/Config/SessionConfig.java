package Config;

import org.eclipse.jetty.server.session.DefaultSessionCache;
import org.eclipse.jetty.server.session.FileSessionDataStore;
import org.eclipse.jetty.server.session.SessionCache;
import org.eclipse.jetty.server.session.SessionHandler;

import java.io.File;

public class SessionConfig {
    private static SessionHandler sHandler;

    public static SessionHandler getSessionHandlerInstance() {
        if (sHandler != null) {
            return sHandler;
        }
        sHandler = new SessionHandler();
        SessionCache sessionCache = new DefaultSessionCache(sHandler);

        FileSessionDataStore fileSessionDataStore = new FileSessionDataStore();
        File baseDir = new File(System.getProperty("java.io.tmpdir"));
        File storeDir = new File(baseDir, "javalin-session-store");
        storeDir.mkdir();
        fileSessionDataStore.setStoreDir(storeDir);

        sessionCache.setSessionDataStore(fileSessionDataStore);
        sHandler.setSessionCache(sessionCache);
        sHandler.setHttpOnly(true);

        return sHandler;
    }
}
