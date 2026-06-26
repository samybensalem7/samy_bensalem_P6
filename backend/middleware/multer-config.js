const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Format non supporté. Uniquement JPG, PNG ou WEBP.'), false);
    }
};

const upload = multer({ storage, fileFilter }).single('image');

const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const name = req.file.originalname.split(' ').join('_').split('.')[0];
    const filename = `${name}_${Date.now()}.webp`;
    const outputPath = path.join('images', filename);

    if (!fs.existsSync('images')) {
        fs.mkdirSync('images');
    }

    try {
        await sharp(req.file.buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        req.file.filename = filename;
        req.file.path = outputPath;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = [upload, optimizeImage];