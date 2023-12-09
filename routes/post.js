const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  title:String ,
  description:String, 
  image:String , 
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
  }
});

module.exports = mongoose.model("post" , userSchema);

