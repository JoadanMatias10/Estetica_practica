import mongoose from 'mongoose'

export const connectDatabase = async (uri) => {
  if (!uri) {
    throw new Error('No se ha proporcionado la cadena de conexión a MongoDB (MONGODB_URI).')
  }

  await mongoose.connect(uri, {
    autoIndex: true
  })

  return mongoose.connection
}