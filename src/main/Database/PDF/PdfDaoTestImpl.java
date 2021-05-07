package Database.PDF;

import Config.DeploymentLevel;
import PDF.PDF;
import com.google.api.client.util.DateTime;
import org.bson.types.ObjectId;

import java.io.InputStream;
import java.util.*;

import static PDF.PDFType.FORM;

public class PdfDaoTestImpl implements PdfDao {
  Map<String, PDF> pdfMap;
  Map<ObjectId, PDF> objectIdPDFMap;

  public PdfDaoTestImpl(DeploymentLevel deploymentLevel) {
    if (deploymentLevel != DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException(
          "Should not run in memory test database in production or staging");
    }
    pdfMap = new LinkedHashMap<>();
  }

  @Override
  public Optional<PDF> get(String username) {
    return Optional.ofNullable(pdfMap.get(username));
  }

  @Override
  public Optional<InputStream> getStream(String username) {
    return Optional.ofNullable(pdfMap.get(username).getFileStream());
  }

  @Override
  public Optional<InputStream> getStream(ObjectId id) {
    return Optional.ofNullable(objectIdPDFMap.get(id).getFileStream());
  }

  @Override
  public void save(String uploaderUsername, InputStream fileInputStream) {
    PDF pdf =
        new PDF(
            uploaderUsername,
            Optional.empty(),
            new DateTime(new Date()),
            Optional.empty(),
            fileInputStream,
            FORM);
    pdfMap.put(uploaderUsername, pdf);
    objectIdPDFMap.put(pdf.getId(), pdf);
  }

  @Override
  public void save(String uploaderUsername, InputStream fileInputStream, DateTime uploadedAt) {
    PDF pdf =
        new PDF(
            uploaderUsername,
            Optional.empty(),
            uploadedAt,
            Optional.empty(),
            fileInputStream,
            FORM);
    pdfMap.put(uploaderUsername, pdf);
    objectIdPDFMap.put(pdf.getId(), pdf);
  }

  @Override
  public void delete(String username) {
    PDF pdf = pdfMap.remove(username);
    objectIdPDFMap.remove(pdf.getId());
  }

  @Override
  public void delete(ObjectId id) {
    PDF pdf = objectIdPDFMap.remove(id);
    pdfMap.remove(pdf.getUsername());
  }

  @Override
  public Optional<PDF> get(ObjectId id) {
    return Optional.ofNullable(objectIdPDFMap.get(id));
  }

  @Override
  public Optional<PDF> getByFileId(ObjectId fileId) {
    return pdfMap.values().stream().filter(x -> x.getFileId() == fileId).findFirst();
  }

  @Override
  public List<PDF> getAll() {
    return new ArrayList<>(pdfMap.values());
  }

  @Override
  public int size() {
    return pdfMap.size();
  }

  @Override
  public void save(PDF pdf) {
    pdfMap.put(pdf.getUsername(), pdf);
    objectIdPDFMap.put(pdf.getId(), pdf);
  }

  @Override
  public void delete(PDF pdf) {
    pdfMap.remove(pdf.getUsername());
    objectIdPDFMap.remove(pdf.getId());
  }

  @Override
  public void update(PDF newPdf) {
    pdfMap.put(newPdf.getUsername(), newPdf);
    objectIdPDFMap.put(newPdf.getId(), newPdf);
  }

  @Override
  public void clear() {
    pdfMap.clear();
    objectIdPDFMap.clear();
  }
}
