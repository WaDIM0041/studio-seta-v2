import { Router } from 'express';
import { SERVICES } from '../data/services.js';

export const servicesRouter = Router();

servicesRouter.get('/', (_req, res) => {
  res.json({ services: SERVICES });
});
