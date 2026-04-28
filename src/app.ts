import express from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1', router);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export default app;