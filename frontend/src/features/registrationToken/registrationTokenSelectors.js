const selectRegistrationTokenState = (state) => state.registrationToken;

// HR list
const selectRegistrationTokens = (state) => selectRegistrationTokenState(state).tokens;
const selectRegistrationTokensStatus = (state) => selectRegistrationTokenState(state).tokensStatus;
const selectRegistrationTokensError = (state) => selectRegistrationTokenState(state).tokensError;

// HR create
const selectCreatedRegistrationToken = (state) => selectRegistrationTokenState(state).createdToken;
const selectCreateRegistrationTokenStatus = (state) => selectRegistrationTokenState(state).createStatus;
const selectCreateRegistrationTokenError = (state) => selectRegistrationTokenState(state).createError;

// Public validate
const selectRegistrationValidation = (state) => selectRegistrationTokenState(state).validation;
const selectRegistrationValidationData = (state) => selectRegistrationTokenState(state).validation.info;
const selectRegistrationValidationStatus = (state) => selectRegistrationTokenState(state).validation.status;
const selectRegistrationValidationError = (state) => selectRegistrationTokenState(state).validation.error;

// Public submit
const selectRegistrationSubmit = (state) => selectRegistrationTokenState(state).registration;
const selectRegistrationSubmitStatus = (state) => selectRegistrationTokenState(state).registration.status;
const selectRegistrationSubmitError = (state) => selectRegistrationTokenState(state).registration.error;
const selectRegistrationEmployeeResult = (state) => selectRegistrationTokenState(state).registration.employee;

export {
  selectRegistrationTokenState,
  selectRegistrationTokens,
  selectRegistrationTokensStatus,
  selectRegistrationTokensError,
  selectCreatedRegistrationToken,
  selectCreateRegistrationTokenStatus,
  selectCreateRegistrationTokenError,
  selectRegistrationValidation,
  selectRegistrationValidationData,
  selectRegistrationValidationStatus,
  selectRegistrationValidationError,
  selectRegistrationSubmit,
  selectRegistrationSubmitStatus,
  selectRegistrationSubmitError,
  selectRegistrationEmployeeResult,
};