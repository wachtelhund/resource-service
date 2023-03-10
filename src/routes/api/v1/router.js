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

const PermissionLevels = Object.freeze({
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8
})

/**
 * Makes sure that the user is authenticated.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authenticate = (req, res, next) => {
  try {
    const type = req.headers.authorization.split(' ')[0]
    const token = req.headers.authorization.split(' ')[1]
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!type === 'Bearer' || !payload) {
      throw new Error()
    }
    req.user = {
      username: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      permissionLevel: payload.x_permission_level
    }
    next()
  } catch (error) {
    next(createError(401, 'Accesstoken is missing or invalid'))
  }
}

/**
 * Checks if the user has the required permission level.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @param {number} permissionLevel - The required permission level.
 */
const hasPermission = (req, res, next, permissionLevel) => {
  console.log(req.user.permissionLevel, permissionLevel)
  if (!(req.user.permissionLevel >= permissionLevel)) {
    next(createError(403, 'Forbidden'))
  } else {
    next()
  }
}

router.use(authenticate)

router.param('id', (req, res, next, id) => controller.attachImage(req, res, next, id))

router.get('/images',
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.getAll(req, res, next)
)

router.post('/images',
  (req, res, next) => controller.validateImage(req, res, next),
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.CREATE),
  (req, res, next) => controller.postImage(req, res, next)
)

router.get('/images/:id',
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.getOne(req, res, next)
)

router.put('/images/:id',
  (req, res, next) => controller.validateImage(req, res, next),
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.putOne(req, res, next)
)

router.patch('/images/:id',
  (req, res, next) => controller.validateImage(req, res, next),
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.patchOne(req, res, next)
)

router.delete('/images/:id',
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.deleteOne(req, res, next)
)
