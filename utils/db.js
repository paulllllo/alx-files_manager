/* eslint-disable no-underscore-dangle */

import { MongoClient, ObjectID } from 'mongodb';
import { pwdHash } from './utils';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST ? process.env.DB_HOST : '127.0.0.1';
    const port = process.env.DB_PORT ? process.env.DB_PORT : 27017;
    this.database = process.env.DB_DATABASE
      ? process.env.DB_DATABASE
      : 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(`${this.database}`);
        this.connected = true;
      })
      .catch((err) => console.log(err.message));
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) {
      await this.client.connect(); // Reconnect if not already connected
    }
    const users = await this.client
      .db(this.database)
      .collection('users')
      .countDocuments();
    return users;
  }

  async nbFiles() {
    if (!this.connected) {
      await this.client.connect();
    }
    const files = await this.client
      .db(this.database)
      .collection('files')
      .countDocuments();
    return files;
  }

  async getUser(email) {
    if (!this.connected) {
      await this.client.connect();
    }
    const user = await this.client
      .db(this.database)
      .collection('users')
      .find({ email })
      .toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async userExist(email) {
    const user = await this.getUser(email);
    if (user) {
      return true;
    }
    return false;
  }

  async createUser(email, password) {
    if (!this.connected) {
      await this.client.connect();
    }
    const hashedPwd = pwdHash(password);
    const user = this.client
      .db(this.database)
      .collection('users')
      .insertOne({ email, password: hashedPwd });
    return user;
  }

  async getUserById(id) {
    if (!this.connected) {
      await this.client.connect();
    }
    const _id = new ObjectID(id);
    const user = await this.client
      .db(this.database)
      .collection('users')
      .find({ _id })
      .toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getFileById(id) {
    if (!this.connected) {
      await this.client.connect();
    }
    const _id = new ObjectID(id);
    const file = await this.client
      .db(this.database)
      .collection('files')
      .find({ _id })
      .toArray();
    if (!file.length) {
      return null;
    }
    return file[0];
  }

  async getFilesByParentId(pipeline) {
    if (!this.connected) {
      await this.client.connect();
    }
    const files = await this.client
      .db(this.database)
      .collection('files')
      .aggregate(pipeline)
      .toArray();
    if (!files.length) {
      return null;
    }
    return files;
  }

  async getAllFiles(pipeline) {
    if (!this.connected) {
      await this.client.connect();
    }
    const files = await this.client
      .db(this.database)
      .collection('files')
      .aggregate(pipeline)
      .toArray();
    if (!files.length) {
      return null;
    }
    return files;
  }

  async uploadFile(userId, name, type, isPublic, parentId, localPath = null) {
    if (!this.connected) {
      await this.client.connect();
    }
    const obj = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    if (localPath) {
      obj.localPath = localPath;
    }
    const file = await this.client
      .db(this.database)
      .collection('files')
      .insertOne(obj);
    return file;
  }

  async publish(id) {
    if (!this.connected) {
      await this.client.connect();
    }
    const _id = new ObjectID(id);
    await this.client
      .db(this.database)
      .collection('files')
      .updateOne({ _id }, { $set: { isPublic: true } });
  }

  async unPublish(id) {
    if (!this.connected) {
      await this.client.connect();
    }
    const _id = new ObjectID(id);
    await this.client
      .db(this.database)
      .collection('files')
      .updateOne({ _id }, { $set: { isPublic: false } });
  }
}

const dbClient = new DBClient();
export default dbClient;
