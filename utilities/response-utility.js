const STATUSCODE = {
  CREATED: 201,
  OK: 200,
  SERVER: 500,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

const STATUS = {
  Success: "success",
  Error: "error",
};

const successResponse = (status, data) => {
  return {
    status: status,
    data: data,
  };
};

const errorResponse = (status, data) => {
  return {
    status: status,
    error: data,
  };
};

module.exports = { STATUSCODE, successResponse, errorResponse, STATUS };
