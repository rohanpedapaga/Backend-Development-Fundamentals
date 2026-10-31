# Lab 2 - Express.js REST API with SQLite Database

## Student Information

* **Student Name:** ROHAN PEDAPAGA
* **Registration Number:** 252U1R1188
* **Section:** CSE-2D (214)
* **Course:** Backend Development Fundamentals
* **Lab:** Lab 2 - SQLite Database and Express CRUD Operations

---

## 1. Lab Overview

This lab focuses on designing and implementing a persistent backend RESTful API using Node.js, Express.js, and an embedded SQLite database. Moving beyond in-memory and static data structures, this project establishes a relational data persistence layer to execute end-to-end Create, Read, Update, and Delete (CRUD) operations.

The application manages a book inventory system where:
* The Express web server receives incoming HTTP client requests.
* The `sqlite` wrapper library provides a modern Promise-based interface on top of the underlying `sqlite3` driver.
* SQL queries are executed with parameterized values to safeguard database integrity and protect against SQL injection vulnerabilities.
* Persistent database state is stored locally inside a file-based database (`books.db`), initialized using a structured schema and pre-populated seed data (`database.sql`).

---

## 2. Objectives

The primary objectives of this lab are:
* Connect an Express.js backend server to a local SQLite database using `sqlite` and `sqlite3`.
* Initialize a relational database schema with primary key auto-increment constraints and sample seed data.
* Implement complete CRUD (Create, Read, Update, Delete) routes matching RESTful conventions:
  * `GET /books/`: Retrieve all records from the database.
  * `GET /books/:bookId/`: Query a specific record by primary key using URL parameters.
  * `POST /books/`: Parse JSON request bodies to insert new records into the database.
  * `PUT /books/:bookId/`: Modify and update existing database records by identifier.
  * `DELETE /books/:bookId/`: Remove specific records from the persistent store.
* Utilize asynchronous JavaScript (`async`/`await`) to manage non-blocking database queries smoothly.
* Implement parameterized SQL queries (`?` placeholders) to prevent SQL injection attacks.
* Test and validate all HTTP endpoints and request methods using Postman.

---

## 3. Technologies Used

The project utilizes the following technologies and exact dependency versions as declared in `package.json`:

* **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+ recommended)
* **Web Framework:** [Express.js](https://expressjs.com/) (`^5.3.0` declared in `dependencies`)
* **Database Driver & Wrapper:**
  * [`sqlite3`](https://www.npmjs.com/package/sqlite3) (`^6.0.1`): Core asynchronous C++ SQLite driver for Node.js
  * [`sqlite`](https://www.npmjs.com/package/sqlite) (`^5.1.1`): Promise-based abstraction wrapper over `sqlite3` enabling clean `async`/`await` syntax
* **Development Tool:** [Nodemon](https://nodemon.io/) (`^3.1.14` declared in `devDependencies`) for automated server restarts during development
* **Module System:** CommonJS (`require` / `module.exports`)
* **Protocol & Architecture:** HTTP/1.1 RESTful API
* **API Testing Tool:** Postman

---

## 4. Project Structure

```text
lab-02/
├── node_modules/           # External npm packages and dependencies (gitignored)
├── screenshots/            # Output and verification screenshots
│   ├── delete.png.png      # Screenshot of DELETE /books/:bookId/ operation in Postman
│   ├── get.png.png         # Screenshot of GET /books/ (All books) in Postman
│   ├── get_by_id.png.png   # Screenshot of GET /books/:bookId/ operation in Postman
│   ├── post.png.png        # Screenshot of POST /books/ (Add new book) in Postman
│   ├── put.png.png         # Screenshot of PUT /books/:bookId/ (Update book) in Postman
│   └── sqlite-verification.png # Screenshot of SQLite CLI database verification
├── books.db                # SQLite database binary storage file
├── database.sql            # SQL schema definition and seed data
├── index.js                # Express.js server, database initialization, and CRUD routes
├── package-lock.json       # Exact dependency lockfile for reproducible builds
├── package.json            # Project manifest, scripts, and dependencies
└── README.md               # Lab documentation and student report
```

---

## 5. Prerequisites

Before running this project, ensure you have the following installed on your machine:

* **Node.js**: Version 18.0.0 or higher. Verify installation by running:
  ```bash
  node -v
  ```
* **npm (Node Package Manager)**: Bundled with Node.js. Verify installation by running:
  ```bash
  npm -v
  ```
* **API Client**: [Postman](https://www.postman.com/) or an equivalent tool (such as cURL or Thunder Client) to test GET, POST, PUT, and DELETE HTTP requests.

---

## 6. Installation Instructions

Follow these step-by-step instructions to set up the project locally:

1. Open your terminal or command prompt and navigate to the `lab-02` directory:
   ```bash
   cd lab-02
   ```

2. Install project dependencies:
   Run the following command to install Express, SQLite wrapper, and Nodemon as specified in `package.json`:
   ```bash
   npm install
   ```
   This downloads and configures all required dependencies into the `node_modules/` directory.

---

## 7. Database Configuration and Schema

The application uses an embedded SQLite database (`books.db`). The schema definition and initial seed records are documented in `database.sql`:

```sql
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    price INTEGER,
    pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
('The Alchemist', 'Paulo Coelho', 250, 208),
('Atomic Habits', 'James Clear', 450, 320),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 300, 336),
('Wings of Fire', 'A.P.J. Abdul Kalam', 200, 180),
('The Psychology of Money', 'Morgan Housel', 350, 256),
('Ikigai', 'Hector Garcia', 280, 208),
('Deep Work', 'Cal Newport', 400, 304),
('Think Like a Monk', 'Jay Shetty', 320, 288),
('The 5 AM Club', 'Robin Sharma', 380, 336),
('Zero to One', 'Peter Thiel', 290, 224);
```

### Schema Attributes:
* `id`: Unique identifier, set as `INTEGER PRIMARY KEY AUTOINCREMENT`.
* `title`: Title of the book (`TEXT`).
* `author`: Author of the book (`TEXT`).
* `price`: Retail price of the book in INR (`INTEGER`).
* `pages`: Total page count (`INTEGER`).

---

## 8. How to Run the Express & SQLite Server

The application server can be started in standard production mode or in development mode.

### Option A: Standard Execution
```bash
npm start
```
*(Alternatively: `node index.js`)*

### Option B: Development Mode (Auto-Reloading via Nodemon)
```bash
npm run dev
```

### Expected Console Output
Upon successful initialization of the SQLite database connection and the Express server, the terminal displays:
```text
Database connected successfully
Server running at http://localhost:3000
```

To terminate the server, press `Ctrl + C` in your terminal.

---

## 9. API Endpoint Documentation

The Express application implements a complete RESTful CRUD API on the `/books` resource:

### Summary Table

| HTTP Method | Endpoint Path | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| **GET** | `/books/` | Retrieves all books stored in the database | `200 OK` |
| **GET** | `/books/:bookId/` | Retrieves a specific book by its ID | `200 OK` |
| **POST** | `/books/` | Adds a new book to the database | `200 OK` |
| **PUT** | `/books/:bookId/` | Updates an existing book's details by ID | `200 OK` |
| **DELETE** | `/books/:bookId/` | Deletes a book record from the database by ID | `200 OK` |

---

### Detailed Endpoint Specifications

#### 1. GET /books/ (Retrieve All Books)
* **Description:** Queries the SQLite database and returns the full collection of books.
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/books/`
* **SQL Query Executed:**
  ```sql
  SELECT * FROM book;
  ```
* **Response Status:** `200 OK`
* **Sample Response Body:**
  ```json
  [
    {
      "id": 2,
      "title": "Atomic Habits",
      "author": "James Clear",
      "price": 450,
      "pages": 320
    },
    {
      "id": 3,
      "title": "Rich Dad Poor Dad",
      "author": "Robert Kiyosaki",
      "price": 300,
      "pages": 336
    }
  ]
  ```

#### 2. GET /books/:bookId/ (Retrieve Book by ID)
* **Description:** Queries a single book by its unique primary key `id`.
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/books/:bookId/` (e.g., `http://localhost:3000/books/1`)
* **URL Parameters:** `bookId` (integer) - the primary key of the book.
* **SQL Query Executed:**
  ```sql
  SELECT * FROM book WHERE id = ?;
  ```
* **Response Status:** `200 OK`
* **Sample Response Body:**
  ```json
  {
    "id": 1,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "price": 250,
    "pages": 208
  }
  ```

#### 3. POST /books/ (Create a New Book)
* **Description:** Inserts a newly provided book into the database with values parsed from the JSON body.
* **HTTP Method:** `POST`
* **URL:** `http://localhost:3000/books/`
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "price": 350,
    "pages": 310
  }
  ```
* **SQL Query Executed:**
  ```sql
  INSERT INTO book (title, author, price, pages)
  VALUES (?, ?, ?, ?);
  ```
* **Response Status:** `200 OK`
* **Response Body:**
  ```text
  Book added successfully
  ```

#### 4. PUT /books/:bookId/ (Update an Existing Book)
* **Description:** Updates all attributes (`title`, `author`, `price`, `pages`) of a target book matching `bookId`.
* **HTTP Method:** `PUT`
* **URL:** `http://localhost:3000/books/:bookId/` (e.g., `http://localhost:3000/books/1/`)
* **URL Parameters:** `bookId` (integer) - target book ID.
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "The Alchemist - Updated",
    "author": "Paulo Coelho",
    "price": 400,
    "pages": 250
  }
  ```
* **SQL Query Executed:**
  ```sql
  UPDATE book
  SET title = ?, author = ?, price = ?, pages = ?
  WHERE id = ?;
  ```
* **Response Status:** `200 OK`
* **Response Body:**
  ```text
  Book updated successfully
  ```

#### 5. DELETE /books/:bookId/ (Delete a Book)
* **Description:** Deletes a specific book from the database table matching `bookId`.
* **HTTP Method:** `DELETE`
* **URL:** `http://localhost:3000/books/:bookId/` (e.g., `http://localhost:3000/books/1/`)
* **URL Parameters:** `bookId` (integer) - target book ID to delete.
* **SQL Query Executed:**
  ```sql
  DELETE FROM book WHERE id = ?;
  ```
* **Response Status:** `200 OK`
* **Response Body:**
  ```text
  Book deleted successfully
  ```

---

## 10. Explanation of package.json and Dependencies

The project's dependencies are declared in `package.json`:

```json
{
  "name": "lab-02",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^5.3.0",
    "sqlite": "^5.1.1",
    "sqlite3": "^6.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

### Dependency Roles:
* **`express` (`^5.3.0`)**: The core HTTP server framework providing route handlers, JSON body parser middleware (`express.json()`), and request-response lifecycle management.
* **`sqlite3` (`^6.0.1`)**: Native asynchronous SQLite driver that connects Node.js directly to the local SQLite database engine.
* **`sqlite` (`^5.1.1`)**: A modern Promise-based client wrapper around `sqlite3`. It provides helper methods such as `open()`, `db.all()`, `db.get()`, and `db.run()` that work seamlessly with `async`/`await`.
* **`nodemon` (`^3.1.14`)**: Development tool that watches for source code modifications and automatically restarts the application server.

---

## 11. Database Operations & SQLite Integration

### Database Initialization and Server Lifecycle
In `index.js`, the server initialization is structured to ensure that the database connection is established before listening for incoming HTTP connections:

```javascript
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
```

### Parameterized Queries and SQL Injection Prevention
Direct string concatenation in SQL queries allows untrusted client input to alter SQL execution syntax (SQL injection). To prevent this, all database queries in `index.js` use parameterized queries with `?` placeholders:

* **Single Record Fetch (`db.get`):**
  ```javascript
  const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
  ```
* **Data Mutation (`db.run`):**
  ```javascript
  await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title, author, price, pages, bookId]
  );
  ```
The database engine treats the bound parameters strictly as literal values, ensuring that special characters cannot alter the query structure.

---

## 12. Screenshots

All screenshots from the Postman API test runs and SQLite database verification are embedded below using exact relative paths pointing to the existing files in the `screenshots/` directory.

### 1. GET All Books (`GET /books/`)
Retrieving the complete list of books from the SQLite database via Postman:

![GET all books](screenshots/get.png.png)

*Caption: Postman GET request to `http://localhost:3000/books/` returning HTTP 200 OK with the array of book objects from the database.*

---

### 2. GET Book by ID (`GET /books/:bookId/`)
Querying a specific book using the route parameter `bookId` in Postman:

![GET book by ID](screenshots/get_by_id.png.png)

*Caption: Postman GET request to `http://localhost:3000/books/1` returning HTTP 200 OK for the target book record.*

---

### 3. POST a New Book (`POST /books/`)
Adding a new book record ("The Hobbit") by sending a JSON payload in the request body:

![POST a new book](screenshots/post.png.png)

*Caption: Postman POST request to `http://localhost:3000/books/` with JSON body returning HTTP 200 OK and "Book added successfully".*

---

### 4. PUT / Update a Book (`PUT /books/:bookId/`)
Updating an existing book's details by primary key identifier:

![PUT/update a book](screenshots/put.png.png)

*Caption: Postman PUT request to `http://localhost:3000/books/1/` with updated details returning HTTP 200 OK and "Book updated successfully".*

---

### 5. DELETE a Book (`DELETE /books/:bookId/`)
Removing a specific book record from the database table:

![DELETE a book](screenshots/delete.png.png)

*Caption: Postman DELETE request to `http://localhost:3000/books/1/` returning HTTP 200 OK and "Book deleted successfully".*

---

### 6. SQLite Database Verification
Direct verification of the SQLite database records via the SQLite CLI:

![SQLite Database Verification](screenshots/sqlite-verification.png)

*Caption: SQLite CLI output showing the book records stored in SQLite after testing the CRUD operations, confirming the deletion of book ID 1 and the addition of book ID 11 ("The Hobbit").*

---

## 13. Learning Outcomes

Through completing this lab, the following core backend and database development competencies were acquired:

1. **Relational Database Integration:**
   * Configured an embedded SQLite relational database in an Express.js application using `sqlite` and `sqlite3`.
   * Understood asynchronous database lifecycle management and guaranteed database connection availability before opening the HTTP port.

2. **Full RESTful CRUD Implementation:**
   * Implemented all four primary HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) adhering to REST architectural standards.
   * Leveraged `express.json()` middleware to parse incoming request payloads for create and update operations.

3. **Secure Query Execution:**
   * Applied parameterized queries using `?` placeholders with `db.all()`, `db.get()`, and `db.run()` methods.
   * Gained understanding of how parameterized statements neutralize SQL injection risks.

4. **API Testing with Postman:**
   * Formulated and tested diverse HTTP requests in Postman, including setting HTTP methods, URL route parameters, JSON body payloads, and headers.
   * Verified HTTP response status codes (`200 OK`) and response payloads for correctness.

