import createError from 'http-errors'
import { Image } from '../../models/image.js'

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

  /**
   * Posts an image to the image service and saves it crucial information to the database.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async postImage (req, res, next) {
    try {
      console.log('postAll()')
      const body = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      if (!body.data || !body.contentType) {
        throw new Error('Missing data or contentType in body')
      }
      const response = await fetch(this.#imageServiceUrl, {
        method: 'POST',
        headers: {
          'X-API-Private-Token': process.env.IMAGE_SERVICE_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      if (!response.ok) {
        throw new Error('Bad request')
      }
      const data = await response.json()
      const image = new Image({
        imageURL: data.imageUrl,
        contentType: req.body.contentType,
        id: data.id,
        location: req.body.location,
        description: req.body.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      })

      await image.save()
      res.status(201).json(image)
    } catch (error) {
      next(createError(400, error.message))
    }
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
