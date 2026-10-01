const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Iskolai Nyilvántartó REST API működik!");
});

app.listen(3000, () => {
    console.log("Szerver elindult: http://localhost:3000");
});