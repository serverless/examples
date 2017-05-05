var mongoose = require('mongoose')
var validator = require('validator')

module.exports = mongoose.model('User' , { name : { 
                                                type : String , 
                                                required : true , 
                                                validate : {
                                                    validator : function(name) { 
                                                    return validator.isAlphanumeric(name) 
                                                    } 
                                                } 
                                            } , 
                                            firstname : {
                                                type : String,
                                                required : true,
                                                validate : {
                                                    validator : function(firstname){
                                                        return validator.isAlphanumeric(firstname)
                                                    }
                                                }
                                            } , 
                                            birth : {
                                                type : Date,
                                                required : true

                                            },
                                            city : {
                                                type : String,
                                                required : true,
                                                validate : {
                                                    validator : function(city){
                                                        return validator.isAlphanumeric(city)
                                                    }
                                                }
                                            } , 
                                            ip :   {
                                                type : String,
                                                required : true,
                                                validate : { 
                                                    validator : function(ip){
                                                        return validator.isIP(ip)
                                                    }
                                                }
                                            }})
