import axios from 'axios';

import { GetEnv } from '@get-env';

module.exports = async () => {
  const { port, host, globalPrefix } =
    GetEnv.getMongodbConnectionParametrs('TWO_FA');
  axios.defaults.baseURL = `http://${host}:${port}/${globalPrefix}`;
};
