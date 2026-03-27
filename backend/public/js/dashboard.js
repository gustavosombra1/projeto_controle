const token = localStorage.getItem("token")

if(!token)
 window.location="/login.html"

function logout(){

 localStorage.removeItem("token")

 window.location="/login.html"

}