const { createProxyMiddleware } = require('http-proxy-middleware');

// Strip the /api prefix, since the backend server doesn't expect it.
// When we deploy in production we set the prefix to '/' to point directly to the backend.
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:3200`,
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    })
  );
};
