const API = ""

async function carregarItens(){

  const r = await fetch(API + "/itens")
  const itens = await r.json()

  let html = "<table>"
  html += "<tr><th>Nome</th><th>Tipo</th></tr>"

  itens.forEach(i=>{

    html += `
    <tr>
      <td>${i.nome}</td>
      <td>${i.tipo}</td>
    </tr>
    `

  })

  html += "</table>"

  document.getElementById("lista").innerHTML = html

}

async function salvarItem(){

  const nome = document.getElementById("nome").value
  const tipo = document.getElementById("tipo").value
  const tamanhos = document.getElementById("tamanhos").value.split(",")

  await fetch(API + "/itens",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      nome,
      tipo,
      tamanhos
    })

  })

  document.getElementById("nome").value = ""
  document.getElementById("tamanhos").value = ""

  carregarItens()

}

carregarItens()