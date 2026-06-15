const Book = require("../models/Book");
const fs = require("fs");
const User = require("../models/User");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book.save().then(() => {
    res.status(201).json({ message: "Livre enregistré !" });
  });
};


//controlleur pour modifier un livre 
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
        )
          .then(() => res.status(200).json({ message: "Livre modifié" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// controlleur pour suppirmer un livre 
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};


//controlleur pour afficher les 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
  Book.find()
    .then(books => {
      const sortedBooks = books
        .sort((a, b) => b.averageRating - a.averageRating)            
        .slice(0, 3);

      res.status(200).json(sortedBooks);
    })
    .catch(error => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const alreadyRated = book.ratings.some(
        (rating) => rating.userId === req.auth.userId,
      );
      if (alreadyRated === false) {
        book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
        const sum = book.ratings.reduce((acc, rating) => {
          return acc + rating.grade;
        }, 0);
        book.averageRating = sum / book.ratings.length;
        book.save()
          .then((updatedBook) => {
            res.status(200).json(updatedBook);
          })
          .catch((error) => res.status(500).json({ error }));
      } else {
        res.status(403).json({ message: "Livre deja noté " });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

