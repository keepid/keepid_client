package PDFTest;

import PDF.PdfController;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureOptions;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.visible.PDVisibleSigProperties;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.visible.PDVisibleSignDesigner;
import org.apache.pdfbox.pdmodel.interactive.form.PDSignatureField;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import static PDF.PdfControllerHelper.*;

public class PdfControllerUnitTests {

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

  @Test(expected = IOException.class)
  public void getFieldInformationNullFileTest() throws IOException {
    File pdfInput = new File("");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);
    pdfDocument.close();
  }

  @Test(expected = IllegalArgumentException.class)
  public void getFieldInformationNullPDFDocumentTest() {
    PDDocument pdfDocument = null;
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);
  }

  @Test(expected = IllegalArgumentException.class)
  public void getFieldInformationNullFieldsJSONTest() {
    PDDocument pdfDocument = null;
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);
  }

  @Test
  // NOTE: We need to fix the file so that the buttons are radio
  public void getFieldInformationValidValuesTest1() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

    // Make sure field names are correct
    for (JSONObject field : fieldsJSON) {

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
    pdfDocument.close();
  }

  @Test
  public void getFieldInformationTextFieldTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

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
    pdfDocument.close();
  }

  @Test
  public void getFieldInformationComboBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

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
    pdfDocument.close();
  }

  @Test
  public void getFieldInformationListBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

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
    pdfDocument.close();
  }

  @Test
  public void getFieldInformationCheckBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

    // Set up correct field names and questions
    List<JSONObject> correctFieldsJSON = new LinkedList<>();
    String[] fieldValueOptions = {"Yes"};
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
    pdfDocument.close();
  }

  @Test
  public void getFieldInformationRadioButtonTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);

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
    pdfDocument.close();
  }

  @Test
  public void fillFieldsBasicTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);
    pdfDocument.close();
  }

  @Test
  public void fillFieldsTextFieldTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    formAnswers.put("Name", "Steffen");
    formAnswers.put("Title", "Play");
    formAnswers.put("Address", "123 Market Street");
    formAnswers.put("A different address", "321 Broad Street");
    formAnswers.put("currentdate_af_date", "07/07/2020");

    JSONObject correctFieldValues = new JSONObject();
    correctFieldValues.put("Name", "Steffen");
    correctFieldValues.put("Title", "Play");
    correctFieldValues.put("Address", "123 Market Street");
    correctFieldValues.put("A different address", "321 Broad Street");
    correctFieldValues.put("currentdate_af_date", "07/07/2020");

    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    pdfDocument.close();
  }

  @Test
  public void fillFieldsCheckBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    formAnswers.put("Chicken", true);
    formAnswers.put("Vegetables", false);
    formAnswers.put("Ribeye Steaks", false);
    formAnswers.put("Tomatoes", true);

    JSONObject correctFieldValues = new JSONObject();
    correctFieldValues.put("Chicken", "Yes");
    correctFieldValues.put("Vegetables", "Off");
    correctFieldValues.put("Ribeye Steaks", "Off");
    correctFieldValues.put("Tomatoes", "Yes");

    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }
    pdfDocument.close();
  }

  @Test
  public void fillFieldsRadioButtonTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    formAnswers.put("Radiobuttons", "Yes");

    JSONObject correctFieldValues = new JSONObject();
    correctFieldValues.put("Radiobuttons", "Yes");

    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    formAnswers.put("Radiobuttons", "No");
    correctFieldValues.put("Radiobuttons", "No");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    formAnswers.put("Radiobuttons", "Maybe");
    correctFieldValues.put("Radiobuttons", "Maybe");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }
    pdfDocument.close();
  }

  @Test
  public void fillFieldsListBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    formAnswers.put("Dropdown", "Choice1");

    JSONObject correctFieldValues = new JSONObject();
    correctFieldValues.put("Dropdown", "[Choice1]");

    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    formAnswers.put("Dropdown", "Choice2");
    correctFieldValues.put("Dropdown", "[Choice2]");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    formAnswers.put("Dropdown", "Choice3");
    correctFieldValues.put("Dropdown", "[Choice3]");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }
    pdfDocument.close();
  }

  @Test
  public void fillFieldsComboBoxTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    PDDocument pdfDocument = PDDocument.load(pdfInput);
    JSONObject formAnswers = new JSONObject();
    JSONArray choices = new JSONArray();
    choices.put("Choice1");
    formAnswers.put("Combobox", choices);

    JSONObject correctFieldValues = new JSONObject();
    correctFieldValues.put("Combobox", "[Choice1]");

    fillFields(pdfDocument, formAnswers);
    JSONObject fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    choices = new JSONArray();
    choices.put("Choice2");
    formAnswers.put("Combobox", choices);
    correctFieldValues.put("Combobox", "[Choice2]");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    choices = new JSONArray();
    choices.put("Choice1");
    choices.put("Choice2");
    formAnswers.put("Combobox", choices);
    correctFieldValues.put("Combobox", "[Choice1, Choice2]");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }

    choices = new JSONArray();
    choices.put("Choice1");
    choices.put("Choice2");
    choices.put("Choice3");
    formAnswers.put("Combobox", choices);
    correctFieldValues.put("Combobox", "[Choice1, Choice2, Choice3]");

    pdfInput = new File("src/test/resources/testpdf.pdf");
    pdfDocument = PDDocument.load(pdfInput);
    fillFields(pdfDocument, formAnswers);
    fieldValues = getFieldValues(pdfDocument);

    // We test that all the fields in correctFields have the right value
    for (String key : correctFieldValues.keySet()) {
      Assert.assertEquals(correctFieldValues.getString(key), fieldValues.getString(key));
    }
    pdfDocument.close();
  }

  @Test
  public void fillFieldsSignatureFieldTest() throws IOException {
    File pdfInput = new File("src/test/resources/testpdf.pdf");
    InputStream imageStream = new FileInputStream("src/test/resources/first-love.png"); // PNG
    PDDocument pdfDocument = PDDocument.load(pdfInput);

    PDVisibleSignDesigner visibleSignDesigner = new PDVisibleSignDesigner(imageStream);
    visibleSignDesigner.zoom(0);
    PDVisibleSigProperties visibleSigProperties =
        new PDVisibleSigProperties()
            .visualSignEnabled(true)
            .setPdVisibleSignature(visibleSignDesigner);
    visibleSigProperties.buildSignature();

    PDSignature signature = new PDSignature();
    signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
    signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
    signature.setName("Example Name1");
    signature.setLocation("Philadelphia, PA");
    signature.setReason("Application");
    signature.setSignDate(Calendar.getInstance());

    SignatureOptions signatureOptions = new SignatureOptions();
    signatureOptions.setVisualSignature(visibleSigProperties.getVisibleSignature());
    PDSignatureField signatureField =
        (PDSignatureField) pdfDocument.getDocumentCatalog().getAcroForm().getField("Signature");
    signatureField.setValue(signature);
    pdfDocument.addSignature(signature, signatureOptions);

    PDSignature signatureDocument = signatureField.getSignature();
    Assert.assertEquals(signature.getFilter(), signatureDocument.getFilter());
    Assert.assertEquals(signature.getSubFilter(), signature.getSubFilter());
    Assert.assertEquals(signature.getName(), signatureDocument.getName());
    Assert.assertEquals(signature.getLocation(), signatureDocument.getLocation());
    Assert.assertEquals(signature.getReason(), signatureDocument.getReason());
    Assert.assertEquals(signature.getSignDate(), signatureDocument.getSignDate());
    Assert.assertEquals(
        signature.getCOSObject().getItem(COSName.CONTENTS),
        signatureDocument.getCOSObject().getItem((COSName.CONTENTS)));

    IOUtils.closeQuietly(signatureOptions);
    pdfDocument.close();
  }
}
