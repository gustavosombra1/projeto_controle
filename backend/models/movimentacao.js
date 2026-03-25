import mongoose from "mongoose"

const schema = new mongoose.Schema({

  item:String,
  tamanho:String,
  quantidade:Number,
  acao:String,
  data:{
    type:Date,
    default:Date.now
  }

})

export default mongoose.model("Movimentacao",schema)