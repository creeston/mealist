import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectoToRabbitMQ } from './queue/connection';
import { listenToMenuParsingStatusQueue, listenToMenuOcrStatusQueue } from './presentation/routes/menus';
import { connectToDatabase } from './config/db';
import { router as qrMenusRouter } from './presentation/routes/qrmenus';
import { router as menusRouter } from './presentation/routes/menus';
import { router as restaurantsRouter } from './presentation/routes/restaurants';
import { parse as yamlParse } from 'yaml';
import fs from 'node:fs';

const yamlPath = process.env.YAML_PATH || './src/presentation/api-doc.yaml';
const yamlFile = fs.readFileSync(yamlPath, 'utf8');
const swaggerDocument = yamlParse(yamlFile);

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:4200'],
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/api/GetUserProfile', (req: Request, res: Response) => {
  res.json({
    email: 'mityy2012@gmail.com',
    userId: '1',
  });
});

const options = {
  swaggerOptions: {
    url: '/api-docs/swagger.json',
  },
};

app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerDocument));
app.use('/api-docs', swaggerUi.serveFiles(undefined, options), swaggerUi.setup(undefined, options));

app.use('/qrmenus', qrMenusRouter);
app.use('/menus', menusRouter);
app.use('/restaurants', restaurantsRouter);

connectToDatabase()
  .then(() => {
    connectoToRabbitMQ()
      .then(() => {
        app.listen(port, () => {
          console.log(`Server running at http://localhost:${port}`);
        });
        listenToMenuParsingStatusQueue();
        listenToMenuOcrStatusQueue();
      })
      .catch((error: Error) => {
        console.error('RabbitMQ connection failed', error);
        process.exit();
      });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit();
  });
