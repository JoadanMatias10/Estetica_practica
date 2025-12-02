import PasswordRecoveryAttempt from '../../models/PasswordRecoveryAttempt.js'

const RECOVERY_WINDOW_MINUTES = 15
const MAX_RECOVERY_ATTEMPTS = 3

const normalizeEmail = (email) => email?.trim().toLowerCase()

const getWindowStartDate = () => new Date(Date.now() - RECOVERY_WINDOW_MINUTES * 60 * 1000)

const filterAttemptsWithinWindow = (attempts = [], windowStart) =>
  attempts.reduce((validAttempts, attempt) => {
    const attemptDate = attempt instanceof Date ? attempt : new Date(attempt)

    if (!Number.isNaN(attemptDate.getTime()) && attemptDate >= windowStart) {
      validAttempts.push(attemptDate)
    }

    return validAttempts
  }, [])

const upsertAttemptRecord = async (email, ip, attempts) => {
  const now = new Date()

  const updatePayload = {
    attempts: [...attempts, now],
    lastAttemptAt: now,
  }

  if (ip) {
    updatePayload.ip = ip
  }

  const updatedRecord = await PasswordRecoveryAttempt.findOneAndUpdate(
    { email },
    { $set: updatePayload },
    { upsert: true, new: true }
  )

  return updatedRecord
}

export const isRecoveryRateLimited = async (email) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false

  const windowStart = getWindowStartDate()
  const record = await PasswordRecoveryAttempt.findOne({ email: normalizedEmail })

  if (!record) return false

  const recentAttempts = filterAttemptsWithinWindow(record.attempts, windowStart)

  if (recentAttempts.length !== (record.attempts?.length || 0)) {
    record.attempts = recentAttempts
    await record.save()
  }

  return recentAttempts.length >= MAX_RECOVERY_ATTEMPTS
}

export const registerRecoveryAttempt = async (email, ip) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null

  const windowStart = getWindowStartDate()
  const existingRecord = await PasswordRecoveryAttempt.findOne({ email: normalizedEmail })

  const recentAttempts = filterAttemptsWithinWindow(existingRecord?.attempts, windowStart)

  const record = await upsertAttemptRecord(normalizedEmail, ip, recentAttempts)

  return record
}