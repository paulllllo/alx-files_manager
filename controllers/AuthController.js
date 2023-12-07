/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */

import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import {
  pwdHash,
  getAuthHeader,
  getToken,
  decodeToken,
  getCredentials,
} from '../utils/utils';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = getAuthHeader(req);
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const token = getToken(authHeader);
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    if (user.password !== pwdHash(password)) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const accessToken = v4();
    await redisClient.set(
      `auth_${accessToken}`,
      user._id.toString(),
      60 * 60 * 24
    );
    res.json({ token: accessToken });
    res.end();
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
}

export default AuthController;
