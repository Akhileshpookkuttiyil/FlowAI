export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};
