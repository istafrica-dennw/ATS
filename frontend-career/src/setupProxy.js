const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const path = require("path");

module.exports = function (app) {
  // Serve video files from mounted volume BEFORE proxy
  app.use("/videos", express.static(path.join(__dirname, "../public/videos")));

  // Proxy API requests to backend - use filter function to preserve path
  app.use(
    createProxyMiddleware({
      target: "http://backend:8080",
      changeOrigin: true,
      pathFilter: (path) => path.startsWith("/api"),
    })
  );
};
