require("dotenv").config();
const express = require("express");
const dao = require("better-sqlite3")("db.sqlite3");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
    const result = dao.prepare("SELECT * FROM users").all();
    if (result.length == 0) {
        res.status(404).json(
            {
                error: "No users here"
            }
        );
    } else {
        res.json(result);
    }
});

app.get("/:id", (req, res) => {
    const id = req.params.id;
    const user = dao.prepare("SELECT * FROM users WHERE id=?").get(id);
    if (user == null) {
        res.status(404).json({error: "No user with id " + id});
    } else {
        res.json(user);
    }
});

app.post("/", (req, res) => {
    const name = req.body.name;
    if (name == null) {
        res.status(404).json({
            error: "Enter name",
        });
    } else {
        const exists = dao
            .prepare("SELECT * FROM users WHERE name=?")
            .all(name);

        if (exists.length != 0) {
            res.status(304).json({
                error: "This username was used before",
            });
        } else {
            dao.prepare("INSERT INTO users (name) VALUES (?)").run(req.body.name);
            res.json(req.body.name);
        }
    }
});

app.put("/:id", (req, res) => {
    const id = req.params.id;
    const newName = req.body.name;
    const user = dao.prepare("SELECT * FROM users WHERE id=?").get(id);
    if (user == null) {
        res.status(404).json("No user with id " + id);
    } else {
        if (newName == null) {
            res.status(404).json("Enter new name");
        } else {
            dao.prepare("UPDATE users SET name=? WHERE id=?").run(newName, id);
            res.json(dao.prepare("SELECT * FROM users WHERE id=?").get(id));
        }
    }
});

app.delete("/:id", (req, res) => {
    const id = req.params.id;
    const user = dao.prepare("SELECT * FROM users WHERE id=?").get(id);
    if (user == null) {
        res.status(404).json({error: "No user with id " + id});
    } else {
        dao.prepare("DELETE FROM users WHERE id=?").run(id);
        res.json(user);
    }
});

app.delete("/", (req, res) => {
    dao.prepare("DELETE FROM users").run();
    res.json({success: "Deleted"})
});

app.listen(PORT, () => {
    console.log(`Started server at PORT:${PORT}`);
});
