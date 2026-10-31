const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

const dbPath = "./books.db";

let db = null;

// INITIALIZE DATABASE AND SERVER
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log("Database connected successfully");

        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000");
        });

    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

// GET ALL BOOKS
app.get("/books/", async (request, response) => {
    const books = await db.all("SELECT * FROM book");
    response.send(books);
});

// GET BOOK BY ID
app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    response.send(book);
});

// ADD A NEW BOOK
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?)
    `;

    await db.run(query, [title, author, price, pages]);

    response.send("Book added successfully");
});

// UPDATE A BOOK
app.put("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const query = `
        UPDATE book
        SET title = ?, author = ?, price = ?, pages = ?
        WHERE id = ?
    `;

    await db.run(query, [title, author, price, pages, bookId]);

    response.send("Book updated successfully");
});


// DELETE A BOOK
app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    await db.run(
        "DELETE FROM book WHERE id = ?",
        [bookId]
    );

    response.send("Book deleted successfully");
});


initializeDBAndServer();