/**
 * Main router.
 *
 * @author Hampus Nilsson
 * @version 1.0.0
 */
import express from 'express'
import { ImageController } from '../../../controllers/api/image-controller.js'

const controller = new ImageController()

export const router = express.Router()

router.get('/images', (req, res, next) => controller.getAll(req, res, next))
router.post('/images', (req, res, next) => controller.postAll(req, res, next))
router.get('/images/:id', (req, res, next) => controller.getOne(req, res, next))
router.put('/images/:id', (req, res, next) => controller.putOne(req, res, next))
router.patch('/images/:id', (req, res, next) => controller.patchOne(req, res, next))
router.delete('/images/:id', (req, res, next) => controller.deleteOne(req, res, next))
