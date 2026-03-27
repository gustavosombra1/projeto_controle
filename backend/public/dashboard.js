const token = localStorage.getItem("token")

if(!token)
 window.location="/login.html"

async function carregarDashboard(){

 const r = await fetch("/dashboard",{

  headers:{
   Authorization:"Bearer "+token
  }

 })

 const d = await r.json()

 document.getElementById("totalItens").innerText = d.itens
 document.getElementById("totalMov").innerText = d.movimentacoes
 document.getElementById("totalUsers").innerText = d.usuarios

}

function logout(){

 localStorage.removeItem("token")

 window.location="/login.html"

}

carregarDashboard()