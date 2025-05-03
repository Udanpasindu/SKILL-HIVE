const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      ws: true,
      changeOrigin: true,
    })
  );
};
