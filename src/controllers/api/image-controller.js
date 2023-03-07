export class ImageController {
  async getAll (req, res, next) {
    console.log('getAll()')
    res
      .status(200)
      .json({ message: 'getAll()' })
  }

  async postAll (req, res, next) {
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