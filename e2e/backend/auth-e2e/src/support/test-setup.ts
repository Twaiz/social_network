import axios from 'axios';

import { GetEnv } from '@get-env';

module.exports = async () => {
  // Configure axios for tests to use.
  const { port, host, globalPrefix } =
    GetEnv.getMongodbConnectionParametrs('AUTH');
  axios.defaults.baseURL = `http://${host}:${port}/${globalPrefix}`;
};
