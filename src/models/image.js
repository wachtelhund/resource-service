import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'

/**
 * User model.
 */
const schema = new mongoose.Schema({
  imageURL: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
})

/**
 * Checks user password against database.
 *
 * @param {string} username - Username to check against database.
 * @param {string} password - Plaintext password to check against database.
 * @returns {boolean} True if user exists, false if not.
 */
schema.statics.isCorrectPassword = async function (username, password) {
  const user = await User.findOne({ username })
  const match = await bcrypt.compare(password, user.password)
  if (!user || !match) {
    throw new Error('Invalid login.')
  }
  return user
}

schema.pre('save', async function () {
  if (!validator.isEmail(this.email)) {
    const error = new Error('Invalid email.')
    error.status = 400
    throw error
  }
  this.password = await bcrypt.hash(this.password, 10)
})

export const User = mongoose.model('User', schema)
