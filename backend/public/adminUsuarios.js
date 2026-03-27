const API = ""

const token = localStorage.getItem("token")

if(!token){
    window.location="/login.html"
}

async function carregarUsuarios(){

    const r = await fetch(API+"/usuarios",{
        headers:{
            Authorization:"Bearer "+token
        }
    })

    const usuarios = await r.json()

    let html=""

    usuarios.forEach(u=>{

        html += `
        <tr>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.cargo}</td>
        </tr>
        `

    })

    document.getElementById("listaUsuarios").innerHTML=html

}

async function salvar(){

    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value
    const cargo = document.getElementById("cargo").value

    await fetch(API+"/usuarios",{

        method:"POST",

        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
        },

        body:JSON.stringify({
            nome,
            email,
            senha,
            cargo
        })

    })

    document.getElementById("nome").value=""
    document.getElementById("email").value=""
    document.getElementById("senha").value=""

    carregarUsuarios()

}

carregarUsuarios()