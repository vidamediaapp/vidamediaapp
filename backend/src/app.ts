import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes'; 

const app = express();


app.use(morgan('dev'));
app.use(cors());
app.use(express.json()); 


app.use('/api', routes);   


app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Vida Media Backend funcionando' });
});

export default app;