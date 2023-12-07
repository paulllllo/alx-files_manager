import sha1 from 'sha1';
import { v4 } from 'uuid';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export const pwdHash = (pwd) => sha1(pwd);

export const getAuthHeader = (req) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  return header;
};

export const getToken = (authHeader) => {
  const tokenType = authHeader.substring(0, 6);
  if (tokenType !== 'Basic ') {
    return null;
  }
  return authHeader.substring(6);
};

export const decodeToken = (token) => {
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  if (!decodedToken.includes(':')) {
    return null;
  }
  return decodedToken;
};

export const getCredentials = (decodedToken) => {
  const [email, password] = decodedToken.split(':');
  if (!email || !password) {
    return null;
  }
  return { email, password };
};

export const createFile = (data) => {
  const DEFAULT = '/tmp/files_manager';
  const path = process.env.FOLDER_PATH ? process.env.FOLDER_PATH : DEFAULT;
  const filename = v4();
  const localPath = `${path}/${filename}`;
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  writeFileSync(localPath, data, { encoding: 'base64' });
  return localPath;
};
