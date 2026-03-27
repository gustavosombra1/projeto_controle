const API = ""

async function login(){

 const email = document.getElementById("email").value
 const senha = document.getElementById("senha").value

 const r = await fetch(API+"/login",{

  method:"POST",

  headers:{
   "Content-Type":"application/json"
  },

  body:JSON.stringify({email,senha})

 })

 if(r.status!==200){

  alert("Login inválido")
  return

 }

 const data = await r.json()

 localStorage.setItem("token",data.token)

 window.location = "/dashboard.html"

}