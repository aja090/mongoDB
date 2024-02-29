const express = require('express');
const { connectToDb, getDb } = require('./DB');
const { ObjectId } = require('mongodb');


//! init app & middlleware

const app = express();
const port = 5000;

app.use(express.json())

//! connection db
let db

connectToDb((err) => {
    if (!err) {

        app.listen(port, () => {
            console.log(`app listen to my ${port}`);
        })
        db = getDb()
    }
})


//! routes

//////////////////////////////////////////////////////////////////////*FITCHE ALL BOOK////////////////////////////////////////////////////////////////////

app.get('/Books', (req, res) => {
    //! Pagination
    const page = req.query.p || 0
    const booksPerPage = 3
    //! Pagination

    let Books = [];

    db.collection("Books")
        .find()
        .sort({ author: 1 })
        //! Pagination
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        //! Pagination
        .forEach(Book => Books.push(Book))
        .then(() => {
            res.status(200).json(Books)
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch the doucment" })
        })
})

//////////////////////////////////////////////////////////////////////*SHOW ONE BOOK////////////////////////////////////////////////////////////////////

app.get('/Books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {

        db.collection("Books")
            .findOne({ _id: new ObjectId(req.params.id) }) // Use ObjectId to convert the id string to ObjectId
            .then(doc => {
                if (doc) {
                    res.status(200).json(doc); // Return the found document
                } else {
                    res.status(404).json({ error: "Book not found" }); // Handle the case when the book is not found
                }
            })
            .catch(err => {
                console.error("Error fetching document:", err);
                res.status(500).json({ error: "Could not fetch the document" });
            });

    } else {
        res.status(500).json({ error: "NOT A VALID DOC ID" })
    }
});

//////////////////////////////////////////////////////////////////////*ADD ONE BOOK////////////////////////////////////////////////////////////////////

app.post('/Books', (req, res) => {

    const Book = req.body

    db.collection("Books")
        .insertOne(Book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({ err: "Could not create a new document" })
        })
})

//////////////////////////////////////////////////////////////////////*DELETE ONE BOOK////////////////////////////////////////////////////////////////////

app.delete('/Books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {

        db.collection("Books")
            .deleteOne({ _id: new ObjectId(req.params.id) }) // Use ObjectId to convert the id string to ObjectId
            .then(result => {
                if (result) {
                    res.status(200).json(result); // Return the found result
                } else {
                    res.status(404).json({ error: "Book not found" }); // Handle the case when the book is not found
                }
            })
            .catch(err => {
                console.error("Error Could not delete document:", err);
                res.status(500).json({ error: "Could not delete document" });
            });

    } else {
        res.status(500).json({ error: "NOT A VALID DOC ID" })
    }
})

//////////////////////////////////////////////////////////////////////*UPDATE ONE BOOK////////////////////////////////////////////////////////////////////

app.patch('/Books/:id', (req, res) => {

    const update = req.body;

    if (ObjectId.isValid(req.params.id)) {

        db.collection("Books")
            .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update })
            .then(result => {
                if (result) {
                    res.status(200).json(result)// return the found result
                } else {
                    res.status(500).json({ error: "Book not found" }); // Handle the case when the book is not found
                }
            })
            .catch(err => {
                console.error("Error Could not delete document:", err);
                res.status(500).json({ error: "Could not delete document" });
            })

    } else {
        res.status(500).json({ error: "NOT A VALID DOC ID" })
    }

})


//? This will be executed for all other routes
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

//! indexes

//todo When to Use Indexes:

// Use indexes on columns that are frequently used in WHERE clauses, JOIN conditions, and ORDER BY clauses.
// Consider the trade - off between read and write performance when deciding which columns to index.
// Regularly review and optimize indexes based on query performance.

//? db.Books.find({ rating: 10 }).explain('executionStats')
//* لمن نشغل هذه الكود بترمنل حنلاحظ انو حتى يطلعلي ريتنك عشره احتاج يطب على كل دوكمنت موجود

//! وهاي طريقة حتى نسوي اندكس و نخلي بوينتر بس على الشي الي نريده
//? db.Books.createIndex({ rating: 10 })

//! حتى نشوف وين صار الاندكس
//? db.Books.getIndexes({rating:10})

//! لمن حنسوي اكسبلين و نشوف حنلاحظ مراح على كل دوكمنت لا بس راح على اندكس الي سوينا

//! و حتى نحذف الانكدس الي سوينا نستخدم
//? db.Books.dropIndex({rating:10})

// المهم ميصير بكل وقت نستخدمه لا بس من نحتاجه من تصير عدنه هواي بيانات