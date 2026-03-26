const API = ""

async function carregarItens(){

  const r = await fetch(API + "/itens")
  const itens = await r.json()

  let html = "<ul>"

  itens.forEach(i=>{
    html += `<li>${i.nome}</li>`
  })

  html += "</ul>"

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

  carregarItens()

}

carregarItens()