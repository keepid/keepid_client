package PDFTest;

import PDF.PdfController;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.*;

public class PDFApplicationUnitTests {

  // Get subset of fields of type fieldType
  private List<JSONObject> getFieldsOfType(List<JSONObject> fieldsJSON, String fieldType) {
    List<JSONObject> newFieldsJSON = new LinkedList<>();
    for (JSONObject field : fieldsJSON) {
      if (field.getString("fieldType").equals(fieldType)) {
        newFieldsJSON.add(field);
      }
    }
    return newFieldsJSON;
  }

  private JSONObject createFieldJSON(
      String fieldName, String fieldType, String[] fieldValueOptions) {
    JSONArray fieldValueOptionsJSON = new JSONArray();
    for (String fieldValueOption : fieldValueOptions) {
      fieldValueOptionsJSON.put(fieldValueOption);
    }
    return (new JSONObject()
        .put("fieldName", fieldName)
        .put("fieldType", fieldType)
        .put("fieldValueOptions", fieldValueOptionsJSON.toString())
        .put("fieldMatchedDBName", "")
        .put("fieldMatchedDBVariable", "")
        .put("fieldQuestion", "Please Enter Your " + fieldName));
  }

  class JSONFieldComparator implements Comparator<JSONObject> {
    public int compare(JSONObject a, JSONObject b) {
      return (a.getString("fieldName").compareTo(b.getString("fieldName")));
    }
  }

  @Test
  // NOTE: We need to fix the file so that the buttons are radio
  public void getFieldInformationValidValuesTest1() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Make sure field names are correct
    for (JSONObject field : fieldsJSON) {
      System.out.println(field.toString());

      // Not Editable
      Assert.assertNotEquals("", field.getString("fieldName"));
      Assert.assertNotEquals("", field.getString("fieldType"));
      Assert.assertNotEquals(null, field.getJSONArray("fieldValueOptions").toString());

      // Editable
      Assert.assertNotEquals("", field.getString("fieldQuestion"));
      Assert.assertEquals("", field.getString("fieldMatchedDBName"));
      Assert.assertEquals("", field.getString("fieldMatchedDBVariable"));

      // Is valid fieldType
      Set<String> validFieldTypes = PdfController.validFieldTypes;
      Assert.assertTrue(validFieldTypes.contains(field.getString("fieldType")));
    }
  }

  @Test
  // NOTE: We need to fix the file so that the buttons are radio
  public void getFieldInformationValidValuesTest2() throws IOException {
    File pdfInput = new File("src/test/resources/ss-5.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Make sure field names are correct
    for (JSONObject field : fieldsJSON) {
      System.out.println(field.toString());

      // Not Editable
      Assert.assertNotEquals("", field.getString("fieldName"));
      Assert.assertNotEquals("", field.getString("fieldType"));
      Assert.assertNotEquals(null, field.getJSONArray("fieldValueOptions").toString());

      // Editable
      Assert.assertNotEquals("", field.getString("fieldQuestion"));
      Assert.assertEquals("", field.getString("fieldMatchedDBName"));
      Assert.assertEquals("", field.getString("fieldMatchedDBVariable"));

      // Is valid fieldType
      Set<String> validFieldTypes = PdfController.validFieldTypes;
      Assert.assertTrue(validFieldTypes.contains(field.getString("fieldType")));
    }
  }

  @Test
  // NOTE: We need to fix the file so that the buttons are radio
  public void getFieldInformationValidValuesTest3() throws IOException {
    File pdfInput = new File("src/test/resources/Application_for_a_Birth_Certificate.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Make sure field names are correct
    for (JSONObject field : fieldsJSON) {
      System.out.println(field.toString());

      // Not Editable
      Assert.assertNotEquals("", field.getString("fieldName"));
      Assert.assertNotEquals("", field.getString("fieldType"));
      Assert.assertNotEquals(null, field.getJSONArray("fieldValueOptions").toString());

      // Editable
      Assert.assertNotEquals("", field.getString("fieldQuestion"));
      Assert.assertEquals("", field.getString("fieldMatchedDBName"));
      Assert.assertEquals("", field.getString("fieldMatchedDBVariable"));

      // Is valid fieldType
      Set<String> validFieldTypes = PdfController.validFieldTypes;
      Assert.assertTrue(validFieldTypes.contains(field.getString("fieldType")));
    }
  }

  @Test
  public void getFieldInformationTextFieldTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {};
    correctFieldsJSON.add(createFieldJSON("Name", "TextField", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("Title", "TextField", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("Address", "TextField", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("A different address", "TextField", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("currentdate_af_date", "TextField", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "TextField");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationComboBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {"Choice1", "Choice2", "Choice3"};
    correctFieldsJSON.add(createFieldJSON("Dropdown", "ComboBox", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "ComboBox");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationListBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {"Choice1", "Choice2", "Choice3"};
    correctFieldsJSON.add(createFieldJSON("Combobox", "ListBox", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "ListBox");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationCheckBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {};
    correctFieldsJSON.add(createFieldJSON("Chicken", "CheckBox", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("Vegetables", "CheckBox", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("Ribeye Steaks", "CheckBox", fieldValueOptions));
    correctFieldsJSON.add(createFieldJSON("Tomatoes", "CheckBox", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "CheckBox");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationPushButtonTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {};
    correctFieldsJSON.add(createFieldJSON("Submit", "PushButton", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "PushButton");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();
      System.out.println(field.toString());
      System.out.println(correctField.toString());

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationRadioButtonTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {"Yes", "No", "Maybe"};
    correctFieldsJSON.add(createFieldJSON("Radiobuttons", "RadioButton", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "RadioButton");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }

  @Test
  public void getFieldInformationSignatureFieldTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = new LinkedList<>();
    PdfController.getFieldInformation(pdfDocument, fieldsJSON);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {};
    correctFieldsJSON.add(createFieldJSON("Signature", "SignatureField", fieldValueOptions));
    correctFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> correctFieldIterator = correctFieldsJSON.iterator();

    // Get Only Fields Needed for This Test
    List<JSONObject> testFieldsJSON = getFieldsOfType(fieldsJSON, "SignatureField");
    testFieldsJSON.sort(new JSONFieldComparator());
    Iterator<JSONObject> testFieldsJSONIterator = testFieldsJSON.iterator();

    // Check Not Editable Fields are correct
    while (testFieldsJSONIterator.hasNext() || correctFieldIterator.hasNext()) {
      JSONObject field = testFieldsJSONIterator.next();
      JSONObject correctField = correctFieldIterator.next();

      // Change to equals for GSON
      Assert.assertEquals(correctField.getString("fieldName"), field.getString("fieldName"));
      Assert.assertEquals(correctField.getString("fieldType"), field.getString("fieldType"));
      Assert.assertEquals(
          correctField.getString("fieldValueOptions"),
          field.getJSONArray("fieldValueOptions").toString());
    }
  }
}
