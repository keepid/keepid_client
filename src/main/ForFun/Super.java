package ForFun;

import PDF.PDFType;
import org.bson.codecs.pojo.annotations.BsonProperty;

public class Super {
  @BsonProperty(value = "foo")
  private String foo;

  @BsonProperty(value = "en")
  private PDFType en;

  public Super() {}

  public Super(String foo, PDFType en) {
    this.foo = foo;
    //    List<Class<Super>> a = new ArrayList();
    //    a.add(Super.class);
    //    //    a.add(Super.class);

    this.en = en;
  }

  public String getFoo() {
    return foo;
  }

  public void setFoo(String foo) {
    this.foo = foo;
  }

  public PDFType getEn() {
    return en;
  }

  public void setEn(PDFType en) {
    this.en = en;
  }
}
