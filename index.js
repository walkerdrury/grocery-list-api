const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Initialize the SQLite database
let db = new sqlite3.Database('grocery.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Middleware to parse incoming JSON data
app.use(express.json());

// Create an endpoint to create a new grocery list
app.post('/api/grocery-list', (req, res) => {
  // Validate incoming data
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '"name" is required.' });
  }

  const createGroceryListQuery = 'INSERT INTO GroceryList (name) VALUES (?)';

  // Insert a new grocery list into the database
  db.run(createGroceryListQuery, [name], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create a new grocery list.' });
    } else {
      console.log(`Grocery list "${name}" created successfully.`);
      // Return the newly created grocery list id
      res.json({ id: this.lastID });
    }
  });
});

// Create an endpoint to add items to an existing grocery list
app.post('/api/grocery-list/:id/items', (req, res) => {
  // Validate incoming data
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '"items" must be a non-empty array.' });
  }

  const groceryListId = req.params.id;
  if (!groceryListId) {
    return res.status(400).json({ error: '"groceryListId" is required.' });
  }

  const insertListItemsQuery = 'INSERT INTO ListItems (name, grocery_list_id) VALUES (?, ?)';

  // Insert items into the "ListItems" table for the specified grocery list
  db.run(insertListItemsQuery, [items[0], groceryListId], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to add items to the grocery list.' });
    } else {
      console.log(`Items added successfully to grocery list with id ${groceryListId}.`);
      // Return a success message
      res.json({ message: 'Items added successfully.' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});