import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellidoPaterno: {
      type: String,
      required: true,
      trim: true
    },
    apellidoMaterno: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    telefono: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    rol: {
      type: String,
      required: true,
      enum: ['cliente', 'admin']
    },
    aceptaTerminos: {
      type: Boolean,
      required: true
    },
     twoFactor: {
      code: {
        type: String
      },
      expiresAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('Usuario', usuarioSchema)