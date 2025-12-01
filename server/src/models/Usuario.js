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
     emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerification: {
      token: {
        type: String
      },
      expiresAt: {
        type: Date
      }
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
     twoFactorEnabled: {
      type: Boolean,
      default: false
    },
     twoFactor: {
      code: {
        type: String
      },
      expiresAt: {
        type: Date
      }
    },
     passwordReset: {
      token: {
        type: String
      },
      expiresAt: {
        type: Date
      }
   },
    loginAttempts: {
      count: {
        type: Number,
        default: 0
      },
      lastAttempt: {
        type: Date
      },
      lockUntil: {
        type: Date
      }
    },
    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('Usuario', usuarioSchema)