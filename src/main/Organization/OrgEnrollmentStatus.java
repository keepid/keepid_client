package Organization;

public enum OrgEnrollmentStatus {
    ORG_EXISTS,
    SUCCESSFUL_ENROLLMENT,
    PASS_HASH_FAILURE,
    FIELD_EMPTY,
    NAME_LEN_OVER_30,
    VALID,
    EMAIL_LEN_OVER_40,
    INVALID_CHARACTERS,
    PASS_UNDER_8
}
