const express = require('express')
const router = express.Router()
const {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage
} = require('../controllers/productImages')


router.route('/:id').get(getSingleProductImages); 


router.route('/').post(createImage);

router.route('/photo/:imageID').put(updateImage);

router.route('/photo/:imageID').delete(deleteImage);

module.exports = router
