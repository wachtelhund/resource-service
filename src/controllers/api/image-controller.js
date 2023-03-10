import createError from 'http-errors'
import { Image } from '../../models/image.js'
import sharp from 'sharp'

/**
 * Controller for images.
 */
export class ImageController {
  #imageServiceUrl = 'https://courselab.lnu.se/picture-it/images/api/v1/images/'
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
      const image = await Image.findOne({ id })
      if (!image) {
        throw new Error('Not found')
      }
      req.image = image
      next()
    } catch (error) {
      next(createError(404, 'Image not found'))
    }
  }

  /**
   * Validates the image data.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async validateImage (req, res, next) {
    try {
      if (req.body.data) {
        const buffer = Buffer.from(req.body.data, 'base64')
        const image = await sharp(buffer)
        await image.metadata()
      }
      next()
    } catch (error) {
      next(createError(422, 'Invalid image data'))
    }
  }

  /**
   * Updates an image in the image service.
   *
   * @param {object} req - The request object.
   */
  async updateImage (req) {
    const body = {
      data: req.image.data,
      contentType: req.image.contentType
    }
    const response = await fetch(`${this.#imageServiceUrl + req.image.id}`, {
      method: req.method,
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
        _id: data.id,
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

  /**
   * Gets one image.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async getOne (req, res, next) {
    res
      .status(200)
      .json(req.image)
  }

  /**
   * Updates an image.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async putOne (req, res, next) {
    try {
      const { location, description, contentType, data } = req.body
      if (!location || !description || !contentType || !data) {
        const error = new Error('Missing location, description, contentType or data in body. If you want to partially update, use PATCH.')
        error.status = 400
        throw error
      }
      req.image.location = location
      req.image.description = description
      req.image.contentType = contentType
      req.image.data = data
      await req.image.save()
      await this.updateImage(req)
      res.sendStatus(204)
    } catch (error) {
      const status = error.status || 500
      next(createError(status, error.message))
    }
  }

  /**
   * Partially updates an image.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async patchOne (req, res, next) {
    try {
      const { location, description, contentType, data } = req.body

      if (!location && !description && !contentType && !data) {
        const error = new Error('At least one field must be present to update')
        error.status = 400
        throw error
      }

      if (location) req.image.location = location
      if (description) req.image.description = description
      if (contentType) req.image.contentType = contentType
      if (data) req.image.data = data

      await req.image.save()
      await this.updateImage(req)
      res.sendStatus(204)
    } catch (error) {
      const status = error.status || 500
      next(createError(status, error.message))
    }
  }

  /**
   * Deletes an image.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async deleteOne (req, res, next) {
    try {
      const response = await fetch(this.#imageServiceUrl + req.image.id, {
        method: 'DELETE',
        headers: {
          'X-API-Private-Token': process.env.IMAGE_SERVICE_TOKEN,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        const error = new Error('Bad request')
        error.status = 400
        throw error
      }
      await Image.deleteOne({ _id: req.image.id })
      res.sendStatus(204)
    } catch (error) {
      const status = error.status || 500
      next(createError(status, error.message))
    }
  }
}
