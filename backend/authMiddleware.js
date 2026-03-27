import jwt from "jsonwebtoken"

export function autenticar(req,res,next){

 const token = req.headers.authorization

 if(!token)
  return res.status(401).json({erro:"Token ausente"})

 try{

  const decoded = jwt.verify(
   token.replace("Bearer ",""),
   process.env.JWT_SECRET || "segredo"
  )

  req.usuario = decoded

  next()

 }catch{

  res.status(401).json({erro:"Token inválido"})

 }

}

export function autorizar(...cargosPermitidos){

 return (req,res,next)=>{

  if(!req.usuario)
   return res.status(401).send("Não autenticado")

  if(!cargosPermitidos.includes(req.usuario.cargo))
   return res.status(403).send("Sem permissão")

  next()

 }

}