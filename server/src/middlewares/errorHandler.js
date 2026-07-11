export default (err, req, res, next) => {
  let errorMessages = [];
  let statusCode = 500;
  let message = "Internal server error";
  console.error(err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    message: message,
    errorMessages: errorMessages
  });
};
