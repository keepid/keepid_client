package ForFun;

import org.bson.codecs.pojo.annotations.BsonProperty;

public class Sub extends Super {
  @BsonProperty private String bar;

  //  public Sub() {}
  //
  //  public Sub(String foo, String bar) {
  //    super(foo);
  //    this.bar = bar;
  //  }
  //
  //  public String getBar() {
  //    return bar;
  //  }
  //
  //  public void setBar(String bar) {
  //    this.bar = bar;
  //  }
}
