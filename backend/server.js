import express from "express"
import cors from "cors"
import { prisma } from "./prisma.js"

const app = express()

app.use(cors())
app.use(express.json())

// ESTOQUE
app.get("/estoque", async (req,res)=>{

  const mov = await prisma.movimentacao.findMany()

  const estoque = {}

  mov.forEach(m => {

    if(!estoque[m.item])
      estoque[m.item] = {}

    if(!estoque[m.item][m.tamanho])
      estoque[m.item][m.tamanho] = 0

    if(m.acao === "add")
      estoque[m.item][m.tamanho] += m.quantidade
    else
      estoque[m.item][m.tamanho] -= m.quantidade

  })

  res.json(estoque)

})

// MOVIMENTAR
app.post("/movimentar", async (req,res)=>{

  const {tipo,tamanho,qtd,acao} = req.body

  await prisma.movimentacao.create({
    data:{
      item:tipo,
      tamanho,
      quantidade:qtd,
      acao
    }
  })

  res.send("ok")

})


// HISTÓRICO
app.get("/historico", async (req,res)=>{

  const mov = await prisma.movimentacao.findMany({
    orderBy:{data:"desc"},
    take:50
  })

  res.json(mov)

})

const PORT = process.env.PORT || 3000

app.listen(PORT)