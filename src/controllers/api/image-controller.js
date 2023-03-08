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
    try {
      const image = await Image.findById(id)
      req.image = image
      next()
    } catch (error) {
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
    try {
      const images = await (await Image.find({})).map(image => {
        return {
          id: image.id,
          imageURL: image.imageURL,
          contentType: image.contentType,
          location: image.location,
          description: image.description,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt
        }
      })
      res
        .status(200)
        .json({ images })
    } catch (error) {
      next(createError(500))
    }
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
        const error = new Error('Missing data or contentType in body')
        error.status = 400
        throw error
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
        const error = new Error('Bad request')
        error.status = 400
        throw error
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
      const status = error.status || 500
      next(createError(status, error.message))
    }
  }

  async getOne (req, res, next) {
    res
      .status(200)
      .json(req.image)
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
