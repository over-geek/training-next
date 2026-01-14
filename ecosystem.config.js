module.exports = {
  apps: [
    {
      name: 'training-next',
      script: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080
      }
    }
  ]
};