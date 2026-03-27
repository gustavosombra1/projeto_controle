import express from "express"
import cors from "cors"
import pkg from "pg"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { autenticar, autorizar } from "./authMiddleware.js"

const { Pool } = pkg

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function iniciarBanco() {

  try {

    await pool.query(`

      CREATE TABLE IF NOT EXISTS movimentacao (
        id SERIAL PRIMARY KEY,
        item TEXT,
        tamanho TEXT,
        quantidade INT,
        acao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS itens (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        tamanhos TEXT[],
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        cargo TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

    `)

    console.log("Banco pronto")

  } catch (err) {

    console.error("Erro ao iniciar banco:", err)

  }

}

app.get("/estoque", async (req, res) => {

  try {

    const result = await pool.query("SELECT * FROM movimentacao")

    const mov = result.rows

    const estoque = {}

    mov.forEach(m => {

      if (!estoque[m.item])
        estoque[m.item] = {}

      if (!estoque[m.item][m.tamanho])
        estoque[m.item][m.tamanho] = 0

      if (m.acao === "add")
        estoque[m.item][m.tamanho] += m.quantidade
      else
        estoque[m.item][m.tamanho] -= m.quantidade

    })

    res.json(estoque)

  } catch (err) {

    console.error(err)
    res.status(500).json({ erro: "erro no servidor" })

  }

})

app.post("/movimentar", async (req, res) => {

  try {

    const { tipo, tamanho, qtd, acao } = req.body

    await pool.query(
      `INSERT INTO movimentacao
      (item,tamanho,quantidade,acao)
      VALUES ($1,$2,$3,$4)`,
      [tipo, tamanho, qtd, acao]
    )

    res.send("ok")

  } catch (err) {

    console.error(err)
    res.status(500).send("erro")

  }

})

app.get("/historico", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT * FROM movimentacao
       ORDER BY data DESC
       LIMIT 50`
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("erro")

  }

})

app.get("/itens", autenticar, autorizar("admin","ti","rh"), async (req,res)=>{

  const result = await pool.query(
    "SELECT * FROM itens ORDER BY nome"
  )

  res.json(result.rows)

})

app.post("/itens", autenticar, autorizar("admin","ti","rh"), async (req,res)=>{

  const {nome,tipo,tamanhos} = req.body

  await pool.query(
    `INSERT INTO itens (nome,tipo,tamanhos)
     VALUES ($1,$2,$3)`,
    [nome,tipo,tamanhos]
  )

  res.send("ok")

})

app.post("/usuarios", autenticar, autorizar("admin"), async (req,res)=>{

 const {nome,email,senha,cargo} = req.body

 const hash = await bcrypt.hash(senha,10)

 await pool.query(
 `INSERT INTO usuarios
 (nome,email,senha,cargo)
 VALUES ($1,$2,$3,$4)`,
 [nome,email,hash,cargo]
 )

 res.send("ok")

})

app.post("/login", async (req,res)=>{

 const {email,senha} = req.body

 const result = await pool.query(
  "SELECT * FROM usuarios WHERE email=$1",
  [email]
 )

 const user = result.rows[0]

 if(!user)
  return res.status(401).send("usuário inválido")

 const ok = await bcrypt.compare(
  senha,
  user.senha
 )

 if(!ok)
  return res.status(401).send("senha inválida")

 const token = jwt.sign({

  id:user.id,
  cargo:user.cargo,
  email:user.email

 },process.env.JWT_SECRET || "segredo",{expiresIn:"8h"})

 res.json({token,cargo:user.cargo})

})

app.get("/usuarios", autenticar, autorizar("admin"), async (req,res)=>{

 const result = await pool.query(
  "SELECT id,nome,email,cargo FROM usuarios ORDER BY nome"
 )

 res.json(result.rows)

})

app.get("/dashboard", autenticar, async (req,res)=>{

 const itens = await pool.query(
 "SELECT COUNT(*) FROM itens"
 )

 const mov = await pool.query(
 "SELECT COUNT(*) FROM movimentacao"
 )

 const users = await pool.query(
 "SELECT COUNT(*) FROM usuarios"
 )

 res.json({
  itens:itens.rows[0].count,
  movimentacoes:mov.rows[0].count,
  usuarios:users.rows[0].count
 })

})

app.get("/setup", async (req,res)=>{

 const existe = await pool.query(
 "SELECT * FROM usuarios WHERE cargo='admin' LIMIT 1"
 )

 if(existe.rows.length > 0){

  return res.send("Sistema já configurado")

 }

 const senha = await bcrypt.hash("123456",10)

 await pool.query(
 `INSERT INTO usuarios
 (nome,email,senha,cargo)
 VALUES ($1,$2,$3,$4)`,
 [
  "Administrador",
  "admin@sistema.com",
  senha,
  "admin"
 ]
 )

 res.send("Admin criado com sucesso")

})

const PORT = process.env.PORT || 3000

async function iniciarServidor(){

  await iniciarBanco()

  app.listen(PORT, () => {
    console.log("Servidor rodando")
  })

}

iniciarServidor()