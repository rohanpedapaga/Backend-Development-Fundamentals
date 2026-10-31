const express = require("express");
const path = require("path");
const { createClient } = require("@libsql/client");

const app = express();
app.use(express.json());

let db = null;
let turso = null;
let initPromise = null;

// INITIALIZE DATABASE
const initializeDB = async () => {
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {

        // TURSO DATABASE (VERCEL)
        turso = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN
        });

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                author TEXT,
                price INTEGER,
                pages INTEGER
            )
        `);

        // INSERT INITIAL BOOKS ONLY IF TABLE IS EMPTY
        const result = await turso.execute("SELECT COUNT(*) AS count FROM book");

        if (Number(result.rows[0].count) === 0) {
            const books = [
                ["The Alchemist", "Paulo Coelho", 250, 208],
                ["Atomic Habits", "James Clear", 450, 320],
                ["Rich Dad Poor Dad", "Robert Kiyosaki", 300, 336],
                ["Wings of Fire", "A.P.J. Abdul Kalam", 200, 180],
                ["The Psychology of Money", "Morgan Housel", 350, 256],
                ["Ikigai", "Hector Garcia", 280, 208],
                ["Deep Work", "Cal Newport", 400, 304],
                ["Think Like a Monk", "Jay Shetty", 320, 288],
                ["The 5 AM Club", "Robin Sharma", 380, 336],
                ["Zero to One", "Peter Thiel", 290, 224]
            ];

            for (const book of books) {
                await turso.execute({
                    sql: `INSERT INTO book (title, author, price, pages)
                          VALUES (?, ?, ?, ?)`,
                    args: book
                });
            }
        }

        console.log("Turso database connected successfully");

    } else {

        // LOCAL SQLITE DATABASE
        const sqlite3 = require("sqlite3");
        const { open } = require("sqlite");

        db = await open({
            filename: path.join(__dirname, "books.db"),
            driver: sqlite3.Database
        });

        console.log("SQLite database connected successfully");
    }
};

// DATABASE INITIALIZATION CHECK
const ensureDatabase = () => {
    if (!initPromise) {
        initPromise = initializeDB();
    }

    return initPromise;
};

// DATABASE QUERY FUNCTIONS
const getAll = async (query, params = []) => {
    if (turso) {
        const result = await turso.execute({
            sql: query,
            args: params
        });

        return result.rows.map(row => ({ ...row }));
    }

    return db.all(query, params);
};

const getOne = async (query, params = []) => {
    if (turso) {
        const result = await turso.execute({
            sql: query,
            args: params
        });

        return result.rows.length > 0
            ? { ...result.rows[0] }
            : undefined;
    }

    return db.get(query, params);
};

const runQuery = async (query, params = []) => {
    if (turso) {
        return await turso.execute({
            sql: query,
            args: params
        });
    }

    return db.run(query, params);
};

// INITIALIZE DATABASE BEFORE HANDLING REQUESTS
app.use(async (request, response, next) => {
    try {
        await ensureDatabase();
        next();
    } catch (error) {
        console.error("Database Error:", error.message);
        response.status(500).send("Database connection failed");
    }
});

// GET ALL BOOKS
app.get("/books/", async (request, response) => {
    const books = await getAll("SELECT * FROM book");
    response.send(books);
});

// GET BOOK BY ID
app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const book = await getOne(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    if (!book) {
        return response.status(404).send("Book not found");
    }

    response.send(book);
});

// ADD A NEW BOOK
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?)
    `;

    await runQuery(query, [title, author, price, pages]);

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

    const result = await runQuery(
        query,
        [title, author, price, pages, bookId]
    );

    if (turso && Number(result.rowsAffected) === 0) {
        return response.status(404).send("Book not found");
    }

    response.send("Book updated successfully");
});

// DELETE A BOOK
app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const result = await runQuery(
        "DELETE FROM book WHERE id = ?",
        [bookId]
    );

    if (turso && Number(result.rowsAffected) === 0) {
        return response.status(404).send("Book not found");
    }

    response.send("Book deleted successfully");
});

// START LOCAL SERVER
if (require.main === module) {
    ensureDatabase()
        .then(() => {
            const PORT = process.env.PORT || 3000;

            app.listen(PORT, () => {
                console.log(`Server running at http://localhost:${PORT}`);
            });
        })
        .catch(error => {
            console.error("Database Error:", error.message);
            process.exit(1);
        });
}

// EXPORT APP FOR VERCEL
module.exports = app;