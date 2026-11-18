module.exports = {
  apps: [{
    name: 'oss-b2b-production',
    script: 'server.js',
    instances: 1, // Mode cluster ou instance unique selon SQLite
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
