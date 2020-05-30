package PropertyFileReader;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class GetPropertyValue {
  String propertyValue = "";
  InputStream inputStream;

  public String getPropertyValue(String propertyFileName, String propertyKey) throws IOException {

    try {
      Properties prop = new Properties();
      String fileName = propertyFileName;

      inputStream = getClass().getClassLoader().getResourceAsStream(fileName);

      if (inputStream != null) {
        prop.load(inputStream);
      } else {
        throw new FileNotFoundException("unable to find '" + fileName);
      }

      propertyValue = prop.getProperty(propertyKey);
    } catch (Exception e) {
      System.out.println("Exception: " + e);
    } finally {
      inputStream.close();
    }
    return propertyValue;
  }
}
