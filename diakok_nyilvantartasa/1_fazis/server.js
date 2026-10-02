require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
});

// Főoldal
app.get("/", (req, res) => {
    res.json({
        uzenet: "Iskolai REST API fut"
    });
});

// MySQL kapcsolat teszt
app.get("/api/teszt", async (req, res) => {
    try {
        const [eredmeny] = await db.query(
            "SELECT 1 AS teszt"
        );

        res.json({
            uzenet: "Sikeres MySQL kapcsolat!",
            eredmeny: eredmeny
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            uzenet: "Hiba a MySQL kapcsolatban!"
        });
    }
});

// Összes osztály lekérése
app.get("/api/osztalyok", async (req, res) => {
    try {
        const [osztalyok] = await db.query(
            "SELECT * FROM osztalyok"
        );

        res.json(osztalyok);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            uzenet: "Hiba az osztalyok lekerdezesekor!"
        });
    }
});

// Új osztály létrehozása
app.post("/api/osztalyok", async (req, res) => {
    try {
        const { nev, szak, evfolyam } = req.body;

        if (!nev || !szak || !evfolyam) {
            return res.status(400).json({
                uzenet: "Minden adat megadasa kotelezo!"
            });
        }

        const [eredmeny] = await db.query(
            "INSERT INTO osztalyok (nev, szak, evfolyam) VALUES (?, ?, ?)",
            [nev, szak, evfolyam]
        );

        res.status(201).json({
            uzenet: "Osztaly sikeresen letrehozva!",
            id: eredmeny.insertId
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            uzenet: "Hiba az osztaly letrehozasakor!"
        });
    }
});

// Egy osztály diákjainak lekérése
app.get("/api/osztalyok/:id/diakok", async (req, res) => {
    try {
        const { id } = req.params;

        const [osztalyok] = await db.query(
            "SELECT * FROM osztalyok WHERE id = ?",
            [id]
        );

        if (osztalyok.length === 0) {
            return res.status(404).json({
                uzenet: "Az osztaly nem talalhato!"
            });
        }

        const [diakok] = await db.query(
            "SELECT id, nev, email, osztaly_id FROM diakok WHERE osztaly_id = ?",
            [id]
        );

        res.json(diakok);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            uzenet: "Hiba a diakok lekerdezesekor!"
        });
    }
});

// Összes diák lekérése osztálynévvel
app.get("/api/diakok", async (req, res) => {
    try {
        const [diakok] = await db.query(`
            SELECT 
                diakok.id,
                diakok.nev,
                diakok.email,
                diakok.osztaly_id,
                osztalyok.nev AS osztaly
            FROM diakok
            INNER JOIN osztalyok
            ON diakok.osztaly_id = osztalyok.id
        `);

        res.json(diakok);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            uzenet: "Hiba a diakok lekerdezesekor!"
        });
    }
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Express szerver fut: http://localhost:${PORT}`);
});