module.exports = {
  apps: [
    {
      name: 'training-next',
      script: './node_modules/next/dist/bin/next',
      args: 'next start',
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