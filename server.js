/* eslint-disable jest/require-hook */

import express from 'express';
import router from './routes/index';

const app = express();
app.use(express.json());
app.use(router);

const port = process.env.PORT ? process.env.PORT : 5000;
app.listen(port, () => console.log(`Server Started on port: ${port}`));
