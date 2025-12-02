import mongoose from 'mongoose'

const passwordRecoveryAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    attempts: [
      {
        type: Date,
      },
    ],
    lastAttemptAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('PasswordRecoveryAttempt', passwordRecoveryAttemptSchema)