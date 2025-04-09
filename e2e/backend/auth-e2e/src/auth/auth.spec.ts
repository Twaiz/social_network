import axios from 'axios';

const AUTH_ROUTE = '/auth';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(AUTH_ROUTE);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
