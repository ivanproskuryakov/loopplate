/**
 * error handler middleware
 */
export = () => (err, req, res, next) => {
  return res.redirect(`/exception/${err.status || 400}`);
};
