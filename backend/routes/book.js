const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');


const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, bookCtrl.createBook );
router.put('/:id', auth,  bookCtrl.modifyBook);
router.delete('/:id', auth,  bookCtrl.deleteBook);
router.get('/:id', bookCtrl.getOneBook );


module.exports = router;
