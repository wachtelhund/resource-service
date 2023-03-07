import createError from 'http-errors'

/**
 * Controller for images.
 */
export class ImageController {
  #imageServiceUrl = 'https://courselab.lnu.se/picture-it/images/api/v1/images'
  /**
   * Attaches an image to the request object.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @param {number} id - The id of the image to attach.
   */
  async attachImage (req, res, next, id) {
    const response = await fetch(`${this.#imageServiceUrl}/${id}`)
    if (response.ok) {
      const image = await response.json()
      req.image = image
      next()
    } else {
      next(createError(404, 'Image not found'))
    }
  }

  /**
   * Gets all images.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async getAll (req, res, next) {
    const response = await fetch(this.#imageServiceUrl, {
      method: 'GET',
      headers: {
        'X-API-Private-Token': process.env.IMAGE_SERVICE_TOKEN
      }
    })
    if (!response.ok) {
      next(createError(500, 'Internal server error'))
    }
    const images = await response.json()
    res
      .status(200)
      .json({ images })
  }

  async postImage (req, res, next) {
    console.log('postAll()')
    res
      .status(200)
      .json({ message: 'postAll()' })
  }

  async getOne (req, res, next) {
    console.log('getOne()')
    res
      .status(200)
      .json({ message: 'getOne()' })
  }

  async putOne (req, res, next) {
    console.log('putOne()')
    res
      .status(200)
      .json({ message: 'putOne()' })
  }

  async patchOne (req, res, next) {
    console.log('patchOne()')
    res
      .status(200)
      .json({ message: 'patchOne()' })
  }

  async deleteOne (req, res, next) {
    console.log('deleteOne()')
  }

  async loadImages (req, res, next) {}
}