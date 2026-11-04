const express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");

let db;

// Allowed columns for sorting
const allowedColumns = ["id", "title", "author", "price", "pages"];

// Validate book input
function validateBook(title, author, price, pages) {
    if (!title || !title.trim()) {
        return "Title is required";
    }

    if (!author || !author.trim()) {
        return "Author is required";
    }

    if (price === undefined || price === null || price === "") {
        return "Price is required";
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
        return "Price must be a valid non-negative number";
    }

    if (
        pages !== undefined &&
        (!Number.isInteger(pages) || pages < 0)
    ) {
        return "Pages must be a non-negative integer";
    }

    return null;
}

// GET all books with search, sorting, pagination and price filtering
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        const sortColumn = String(order_by).toLowerCase();
        const sortOrder = String(order).toUpperCase();

        if (!allowedColumns.includes(sortColumn)) {
            return res.status(400).json({
                message: "Invalid order_by column"
            });
        }

        if (!["ASC", "DESC"].includes(sortOrder)) {
            return res.status(400).json({
                message: "Order must be ASC or DESC"
            });
        }

        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (
            !/^\d+$/.test(String(limit)) ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                message: "Limit must be between 1 and 100"
            });
        }

        if (
            !/^\d+$/.test(String(offset)) ||
            !Number.isInteger(pageOffset)
        ) {
            return res.status(400).json({
                message: "Offset must be a non-negative integer"
            });
        }

        const conditions = [];
        const params = [];

        // Search books by partial title
        if (search_q.trim()) {
            conditions.push("title LIKE ?");
            params.push(`%${search_q}%`);
        }

        // Minimum price filter
        if (min_price !== undefined) {
            if (min_price === "" || !Number.isFinite(Number(min_price))) {
                return res.status(400).json({
                    message: "Minimum price must be numeric"
                });
            }

            conditions.push("price >= ?");
            params.push(Number(min_price));
        }

        // Maximum price filter
        if (max_price !== undefined) {
            if (max_price === "" || !Number.isFinite(Number(max_price))) {
                return res.status(400).json({
                    message: "Maximum price must be numeric"
                });
            }

            conditions.push("price <= ?");
            params.push(Number(max_price));
        }

        if (
            min_price !== undefined &&
            max_price !== undefined &&
            Number(min_price) > Number(max_price)
        ) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price"
            });
        }

        let sql = "SELECT * FROM book";

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // Sorting uses validated column and direction
        sql += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

        params.push(pageLimit, pageOffset);

        const books = await db.all(sql, params);

        return res.status(200).json({
            message: "Books retrieved successfully",
            books
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// GET a single book by ID
app.get("/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!/^\d+$/.test(bookId) || Number(bookId) < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json(book);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// POST a new book
app.post("/books", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        const errorMessage = validateBook(title, author, price, pages);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [title.trim(), author.trim(), price, pages ?? null]
        );

        return res.status(201).json({
            message: "Book added successfully",
            bookId: result.lastID
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// PUT to update a book
app.put("/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, price, pages } = req.body;

        if (!/^\d+$/.test(bookId) || Number(bookId) < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const errorMessage = validateBook(title, author, price, pages);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [title.trim(), author.trim(), price, pages ?? null, bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json({
            message: "Book updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// DELETE a book
app.delete("/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!/^\d+$/.test(bookId) || Number(bookId) < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// Connect database and start server
async function startServer() {
    try {
        db = await sqlite.open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log("Database connected successfully");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();