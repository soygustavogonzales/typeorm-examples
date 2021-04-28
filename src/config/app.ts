export default {
  name: process.env.APP_NAME,
  node_env: process.env.NODE_ENV,
  port: process.env.APP_SERVER_PORT,
  version: process.env.APP_VERSION,
  cors_allowed: process.env.CORS_ALLOWED_DOMAIN,
  api_styles: `${process.env.API_STYLES_URL}/api/${process.env.API_STYLES_VERSION}`,
  api_styles_key: process.env.API_STYLES_KEY,
  api_security: `${process.env.API_SECURITY_URL}/api/${process.env.API_SECURITY_VERSION}`,
  api_security_key: process.env.API_SECURITY_KEY,
  api_store: `${process.env.API_STORE_URL}/api/${process.env.API_STORE_VERSION}`,
  api_store_key: process.env.API_STORE_KEY,
  jwt: process.env.JWT_SECRET,
  jwt_expiry: process.env.JWT_EXPIRYIN,
  api_key: process.env.API_KEY,
  NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
  NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED || false
};
