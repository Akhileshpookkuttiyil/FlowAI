const toReadableMessage = (value) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object") {
    if (typeof value.message === "string" && value.message.trim()) {
      return value.message;
    }

    if (typeof value.error === "string" && value.error.trim()) {
      return value.error;
    }
  }

  return "";
};

export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  const apiError = toReadableMessage(error?.response?.data?.error);
  if (apiError) {
    return apiError;
  }

  const apiMessage = toReadableMessage(error?.response?.data?.message);
  if (apiMessage) {
    return apiMessage;
  }

  const directMessage = toReadableMessage(error?.message);
  if (directMessage) {
    return directMessage;
  }

  return fallbackMessage;
};
