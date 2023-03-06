/**
 * Main router.
 *
 * @author Hampus Nilsson
 * @version 1.0.0
 */
import express from 'express'
import { ImageController } from '../../../controllers/api/image-controller.js'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'

const controller = new ImageController()

export const router = express.Router()

const authenticate = (req, res, next) => {
  try {
    const type = req.headers.authorization.split(' ')[0]
    const token = req.headers.authorization.split(' ')[1]
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!type === 'Bearer' || !payload) {
      throw new Error()
    }
    next()
  } catch (error) {
    next(createError(401, 'Unauthorized'))
  }
}

router.get('/images', authenticate, (req, res, next) => controller.getAll(req, res, next))
router.post('/images', (req, res, next) => controller.postAll(req, res, next))
router.get('/images/:id', (req, res, next) => controller.getOne(req, res, next))
router.put('/images/:id', (req, res, next) => controller.putOne(req, res, next))
router.patch('/images/:id', (req, res, next) => controller.patchOne(req, res, next))
router.delete('/images/:id', (req, res, next) => controller.deleteOne(req, res, next))
