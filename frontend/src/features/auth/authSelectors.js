const selectAuth = (state) => state.auth;

const selectIsAuthenticated = (state) => !!state.auth.isAuthenticated;
const selectCurrentUser = (state) => state.auth.user;
const selectIsHR = (state) => !!state.auth.isHR;

const selectToken = (state) => state.auth.token;

const selectInitStatus = (state) => state.auth.initStatus;
const selectLoginStatus = (state) => state.auth.loginStatus;
const selectProfileStatus = (state) => state.auth.profileStatus;

const selectAuthError = (state) => state.auth.error;

export {
  selectAuth,
  selectIsAuthenticated,
  selectCurrentUser,
  selectIsHR,
  selectToken,
  selectInitStatus,
  selectLoginStatus,
  selectProfileStatus,
  selectAuthError,
};