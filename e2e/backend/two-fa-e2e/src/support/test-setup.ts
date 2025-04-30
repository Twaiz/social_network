import axios from 'axios';

module.exports = async () => {
  // Configure axios for tests to use.
  const host = process.env.SERVER_HOST ?? 'localhost';
  const port = process.env.SERVER_PORT ?? '3000';
  const globalPrefix = process.env.SERVER_GLOBALPREFIX ?? 'api';
  axios.defaults.baseURL = `http://${host}:${port}/${globalPrefix}`;
};
