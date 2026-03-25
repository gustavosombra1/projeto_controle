const API = "http://localhost:3000"

const fardas=["Camisa Social Verde","Camisa Polo Verde","Camisa Branca", "Colete Treinamento"]
const botas=["Bota Branca","Bota Preta"]

const tF=["P","M","G","GG","XGG"]
const tB=Array.from({length:13},(_,i)=>i+34)

let estoque={}

async function init(){
await carregar()
preencher()
render()
carregarHistorico()
}

function preencher(){
const sel=document.getElementById("tipo")
sel.innerHTML=""
;[...fardas,...botas].forEach(i=>sel.innerHTML+=`<option>${i}</option>`)
atualizarTamanhos()
}

function atualizarTamanhos(){
const tipo=document.getElementById("tipo").value
const sel=document.getElementById("tamanho")
sel.innerHTML=""
const lista=fardas.includes(tipo)?tF:tB
lista.forEach(t=>sel.innerHTML+=`<option>${t}</option>`)
}

document.addEventListener("change",e=>{
if(e.target.id==="tipo") atualizarTamanhos()
})

async function carregar(){
const r=await fetch(API+"/estoque")
estoque=await r.json()
}

function render(){
let html="<table><tr><th>Item</th><th>Total</th></tr>"
for(let i in estoque){
let total=Object.values(estoque[i]).reduce((a,b)=>a+b,0)
html+=`<tr><td>${i}</td><td>${total}</td></tr>`
}
html+="</table>"
document.getElementById("resumo").innerHTML=html
}

async function movimentar(){
const tipo=document.getElementById("tipo").value
const tamanho=document.getElementById("tamanho").value
const qtd=parseInt(document.getElementById("qtd").value)
const acao=document.getElementById("acao").value

await fetch(API+"/movimentar",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({tipo,tamanho,qtd,acao})
})

await carregar()
render()
carregarHistorico()
}

async function carregarHistorico(){
const r=await fetch(API+"/historico")
const data=await r.json()

let html="<table><tr><th>Item</th><th>Tam</th><th>Qtd</th><th>Ação</th><th>Data</th></tr>"

data.forEach(m=>{
  const cor = m.acao === "add" ? "#d4edda" : "#f8d7da"

  html+=`<tr style="background:${cor}">
    <td>${m.item}</td>
    <td>${m.tamanho}</td>
    <td>${m.quantidade}</td>
    <td>${m.acao}</td>
    <td>${new Date(m.data).toLocaleString()}</td>
  </tr>`
})

html+="</table>"
document.getElementById("historico").innerHTML=html
}

init()