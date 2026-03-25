import mysql from "mysql2"

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: 1234,
  database: "controle",
  waitForConnections: true,
  connectionLimit: 10
})