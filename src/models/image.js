import mongoose from 'mongoose'

/**
 * Image model.
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
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['image/jpeg', 'image/png', 'image/gif'],
    required: true
  },
  id: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    }
  }

})

// schema.virtual('id').get(function () {
//   return this._id.toHexString()
// })

schema.pre('save', async function () {
  this.id = this._id.toHexString()
})

export const Image = mongoose.model('Image', schema)
