import httpStatus from 'http-status';

function sendResponse(res, responseData) {
  const {
    success = false,
    statusCode = httpStatus.OK,
    message = 'no information provided',
    data = [],
  } = responseData;

  // const responseDataArray = Array.isArray(data) ? data : [data];
  res.status(statusCode).json({ success, message, data: data });
}

export default sendResponse;
