import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv' 

import app from './app.js'
import { connectDatabase } from './config/database.js'

dotenv.config();

const PORT = process.env.PORT || 4000;

const bootstrap = async () => {
  try {
    await connectDatabase(process.env.MONGODB_URI)
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

bootstrap()