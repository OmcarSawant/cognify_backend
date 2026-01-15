export const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? 'Internal server error'
        : err.message || 'Something went wrong'
  });
};

