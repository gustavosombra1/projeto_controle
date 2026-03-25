import express from "express"
import cors from "cors"
import { prisma } from "./prisma.js"

const app = express()

app.use(cors())
app.use(express.json())

// TESTE DE VIDA DO SERVIDOR
app.get("/", (req,res)=>{
  res.send("API funcionando")
})

// ESTOQUE
app.get("/estoque", async (req,res)=>{

  try{

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

  }catch(err){
    console.error(err)
    res.status(500).send("Erro no estoque")
  }

})


// MOVIMENTAR
app.post("/movimentar", async (req,res)=>{

  try{

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

  }catch(err){
    console.error(err)
    res.status(500).send("Erro ao movimentar")
  }

})


// HISTÓRICO
app.get("/historico", async (req,res)=>{

  try{

    const mov = await prisma.movimentacao.findMany({
      orderBy:{data:"desc"},
      take:50
    })

    res.json(mov)

  }catch(err){
    console.error(err)
    res.status(500).send("Erro no histórico")
  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log("Servidor rodando na porta " + PORT)
})