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