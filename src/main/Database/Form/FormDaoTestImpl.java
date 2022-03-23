package Database.Form;

import Config.DeploymentLevel;
import Form.Form;
import org.bson.types.ObjectId;

import java.util.*;

public class FormDaoTestImpl implements FormDao {
  Map<String, Form> formMap;
  Map<ObjectId, Form> objectIdFormMap;

  public FormDaoTestImpl(DeploymentLevel deploymentLevel) {
    if (deploymentLevel != DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException(
          "Should not run in memory test database in production or staging");
    }
    formMap = new LinkedHashMap<>();
    objectIdFormMap = new LinkedHashMap<>();
  }

  @Override
  public Optional<Form> get(String username) {
    return Optional.ofNullable(formMap.get(username));
  }

  @Override
  public void delete(ObjectId id) {
    Form form = objectIdFormMap.remove(id);
    formMap.remove(form.getUsername());
  }

  @Override
  public Optional<Form> get(ObjectId id) {
    return Optional.ofNullable(objectIdFormMap.get(id));
  }

  @Override
  public Optional<Form> getByFileId(ObjectId fileId) {
    return formMap.values().stream().filter(x -> x.getFileId() == fileId).findFirst();
  }

  @Override
  public List<Form> getAll() {
    return new ArrayList<>(formMap.values());
  }

  @Override
  public int size() {
    return formMap.size();
  }

  @Override
  public void save(Form form) {
    formMap.put(form.getUsername(), form);
    objectIdFormMap.put(form.getId(), form);
  }

  @Override
  public void delete(Form form) {
    formMap.remove(form.getUsername());
    objectIdFormMap.remove(form.getId());
  }

  @Override
  public void update(Form newForm) {
    formMap.put(newForm.getUsername(), newForm);
    objectIdFormMap.put(newForm.getId(), newForm);
  }

  @Override
  public void clear() {
    formMap.clear();
    objectIdFormMap.clear();
  }
}
