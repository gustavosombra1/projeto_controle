const API = ""
const token = localStorage.getItem("token")

if(!token)
 window.location="/login.html"

// FARDAMENTOS
// const r = await fetch("/itens")
// const itens = await r.json()

let itens = []

// TAMANHOS
const tamanhosFarda = ["P","M","G","GG","XGG"]
const tamanhosBota = Array.from({length:13},(_,i)=>i+34)
const tamanhoUnico = ["U"]

let estoque = {}

async function init(){

  await carregarItens()
  await carregarEstoque()

  preencherTipos()
  renderEstoque()
  carregarHistorico()

}
// PREENCHER SELECT DE ITENS
function preencherTipos(){

  const sel = document.getElementById("tipo")
  sel.innerHTML = ""

  itens.forEach(i=>{

    sel.innerHTML += `
      <option value="${i.nome}">
        ${i.nome}
      </option>
    `

  })

  atualizarTamanhos()

}

// ATUALIZAR TAMANHOS AUTOMATICAMENTE
function atualizarTamanhos(){

  const tipo = document.getElementById("tipo").value
  const sel = document.getElementById("tamanho")

  sel.innerHTML = ""

  const item = itens.find(i => i.nome === tipo)

  if(!item) return

  item.tamanhos.forEach(t=>{

    sel.innerHTML += `
      <option value="${t}">
        ${t}
      </option>
    `

  })

}

// DETECTAR TROCA DE ITEM
document.addEventListener("change", e => {
    if(e.target.id === "tipo"){
        atualizarTamanhos()
    }
})

// CARREGAR ESTOQUE DO BACKEND
async function carregarEstoque(){

    const r = await fetch(API + "/estoque")
    estoque = await r.json()

}

// MOSTRAR RESUMO DO ESTOQUE
function renderEstoque(){

let html = `
<table class="table table-striped table-hover">

<thead class="table-dark">
<tr>
<th>Item</th>
<th>Total</th>
</tr>
</thead>

<tbody>
`

for(let item in estoque){

let total = Object.values(estoque[item]).reduce((a,b)=>a+b,0)

html += `
<tr>
<td>${item}</td>
<td><span class="badge bg-primary">${total}</span></td>
</tr>
`
}

html += "</tbody></table>"

document.getElementById("resumo").innerHTML = html

}

// ADICIONAR OU REMOVER ITENS
async function movimentar(){

    const tipo = document.getElementById("tipo").value
    const tamanho = document.getElementById("tamanho").value
    const qtd = parseInt(document.getElementById("qtd").value)
    const acao = document.getElementById("acao").value

    if(!qtd || qtd <= 0){
        alert("Informe uma quantidade válida")
        return
    }

    await fetch(API + "/movimentar",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            tipo,
            tamanho,
            qtd,
            acao
        })
    })

    await carregarEstoque()
    renderEstoque()
    carregarHistorico()

}

// HISTÓRICO
async function carregarHistorico(){

    const r = await fetch(API + "/historico")
    const data = await r.json()

    let html = "<table>"
    html += "<tr><th>Item</th><th>Tam</th><th>Qtd</th><th>Ação</th><th>Data</th></tr>"

    data.forEach(m => {

        const cor = m.acao === "add"
        ? "#d4edda"
        : "#f8d7da"

        html += `
        <tr style="background:${cor}">
            <td>${m.item}</td>
            <td>${m.tamanho}</td>
            <td>${m.quantidade}</td>
            <td>${m.acao}</td>
            <td>${new Date(m.data).toLocaleString()}</td>
        </tr>
        `
    })

    html += "</table>"

    document.getElementById("historico").innerHTML = html

}
async function carregarItens(){

  const r = await fetch(API + "/itens")
  itens = await r.json()

}
init()