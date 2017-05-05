
var mongoose = require('mongoose')
var bluebird = require('bluebird')
var validator = require('validator')
var UserModel = require('./model/User.js')

mongoose.Promise = bluebird


var mongoString = '' // MongoDB URL

module.exports.user = (event, context, callback) => {
  
  var db = mongoose.connect(mongoString).connection

  var id = event.pathParameters.id

  if(!validator.isAlphanumeric(id)) throw Error('Incorrect id')

  db.once('open' , () => {
      
 
    
      UserModel
      .find({_id : event.pathParameters.id})
      .then( user => {

        callback(null, { statusCode : 200 , body : JSON.stringify(user)} );

      })
      .catch(err => {

        callback(err)

      })
      .finally( () => {

        //Close db connection or node event loop won't exit , and lambda will timeout
        db.close()

      })

  })

}


module.exports.createUser = (event, context, callback) => {
  

  var db = mongoose.connect(mongoString).connection
  
  var data = JSON.parse(event.body)
  

  var user = new UserModel({name : data.name , firstname : data.firstname , birth : data.birth  , city : data.city , ip : event.requestContext.identity.sourceIp }) 

  console.log(user)
  
  var err = user.validateSync()
  
  console.log(err)

  if(err)
  {
    console.log(err)
    throw Error('Incorrect user data')
  }


  db.once('open' , () => {

      user
      .save()
      .then(() => {

        callback(null , { statusCode : 200 , body : JSON.stringify({ id : user._id}) })

      })
      .catch(err => {

        callback(err)

      })
      .finally( () => {
        db.close()
      })
     

  })


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.deleteUser = (event, context, callback) => {
  
  var db = mongoose.connect(mongoString).connection
  var id = event.pathParameters.id

  if(!validator.isAlphanumeric(id)) throw Error('Incorrect id')


  db.once('open' , ()=> {

    UserModel
    .remove({_id : event.pathParameters.id })
    .then( () => {
      callback(null , {statusCode : 200 , body : JSON.stringify("Ok") })
    })
    .catch( err => {
      callback(err)
    })
    .finally( () =>{
      db.close()
    })

  })

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.updateUser = (event, context, callback) => {
  
  var db = mongoose.connect(mongoString).connection

   var data = JSON.parse(event.body)
  
  var id =  event.pathParameters.id
  
  if(!validator.isAlphanumeric(id)) throw Error('Incorrect id')

  var user = new UserModel ({ _id : id , name : data.name , firstname : data.firstname  , birth : data.birth,  city : data.city , ip : event.requestContext.identity.sourceIp }) 
  
  var err = user.validateSync()

  if(err) throw Error('Incorrect parameter')
  db.once('open' , ()=> {

    //.save could be used too

    UserModel.findByIdAndUpdate( id , user)
    .then( () =>{
      callback(null , { statusCode : 200 , body : JSON.stringify("Ok") })
    })
    .catch( (err) => {
      callback(err)
    })
    .finally(()=>{
      db.close()
    })
      
  })
  
};
