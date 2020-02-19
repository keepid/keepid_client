package Config;

import org.eclipse.jetty.server.session.DefaultSessionCache;
import org.eclipse.jetty.server.session.FileSessionDataStore;
import org.eclipse.jetty.server.session.SessionCache;
import org.eclipse.jetty.server.session.SessionHandler;

import java.io.File;
import java.nio.file.Paths;

public class SessionConfig {
    private static SessionHandler sHandler;

    public static SessionHandler getSessionHandlerInstance() {
        System.out.println("GETTING SESSION HANDLER INSTANCE");
        if (sHandler != null) {
            return sHandler;
        }
        sHandler = new SessionHandler();
        SessionCache sessionCache = new DefaultSessionCache(sHandler);

        FileSessionDataStore fileSessionDataStore = new FileSessionDataStore();
        File storeDir = new File(Paths.get("session-store").toAbsolutePath().toString());
        storeDir.mkdir();
        System.out.println(storeDir);
        fileSessionDataStore.setStoreDir(storeDir);

        sessionCache.setSessionDataStore(fileSessionDataStore);
        sHandler.setSessionCache(sessionCache);
        sHandler.setHttpOnly(true);

        return sHandler;
    }
}
