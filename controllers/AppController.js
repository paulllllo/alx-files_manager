import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    let dbAlive = false;
    if (dbClient.isAlive()) {
      dbAlive = true;
    }
    let redisAlive = false;
    if (redisClient.isAlive()) {
      redisAlive = true;
    }
    res.json({ redis: redisAlive, db: dbAlive });
    res.end();
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    res.json({ users: nbUsers, files: nbFiles });
    res.end();
  }
}

export default AppController;
