
const catchAsyncErrors = (theFunc) => async (req, res, next) => {
  try {
    await theFunc(req, res, next);
  } catch (error) {
    if (next) {
      next(error);
    }
  }
};

export default catchAsyncErrors;
