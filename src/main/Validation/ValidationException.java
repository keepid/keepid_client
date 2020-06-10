package Validation;

public class ValidationException extends Exception {

  private String errorMessage;

  public ValidationException(String errorMessage) {
    super(errorMessage);
    this.errorMessage = errorMessage;
  }

  public String getMessage() {
    return this.errorMessage;
  }
}
