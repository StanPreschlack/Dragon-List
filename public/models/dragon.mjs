import { Schema, model }  from "mongoose";

const dragonModel = new Schema({
    dragonName:{
        type:String,
        required:true,
        trim:true
    },
    rider:{
        type:String,
        required:true,
        trim:true
    },     
    identification:{
        type:String,
        required:true,
        trim:true
    },    
    house:{
        type:String,
        required:true,
        trim:true
    }    
})
 
const DragonModel = model("dragon", dragonModel)

export default DragonModel
