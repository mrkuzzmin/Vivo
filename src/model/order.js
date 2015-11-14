/*
-Id
-table(cnt)
-officiant(cnt)
 */
var mongoose=require('mongoose');
var url =require('url');
var db=require('../db/db');
var orderSchem=mongoose.Schema({
   Id:{
      type:Number,
      unique:true,
      required:true
   },
   Table:{
      type:Number,
      unique:false,
      required:true
   },
   Officiant:{
      type:Number,
      unique:false,
      required:true
   },
   Status: {
      type:String,
      unique:false,
      required:true
   },
   Order:{
      type:Array,
      unique:false,
      required:false
   }
});

var dishSchem=mongoose.Schema({
   Id:{
      type:Number,
      unique:true,
      required:true
   },
   Name:{
      type:String,
      unique:true,
      required:true
   },
   Cost:{
      type:Number,
      unique:false,
      required:true
   },
   Category:{
      type:Number,
      unique:false,
      required:true
   } //свзяь
});

module.exports = function(app){
   app.post('/order/new', function(req, res){
      var order = db.model('orders', orderSchem);
      var create = function(data){
         var ordePostedElem = new order(data);
         ordePostedElem.save(function(){
            console.log(arguments);
         });
      };
      db.getNextSequence('orderid', function(id){
         create({
            Id: id,
            Status: 'Open',
            Table: req.body['Table'],
            Officiant: req.body['Officiant']
         });
         res.send(''+id);
      });
   });

   app.post('/order/appendToOrder', function(req, res){
      /**
       * OrderId
       * [
       *   {
       *      DishId, Status
       *   },
       *   {
       *      DishId, Status
       *   }
       * ]
       * */
      var order = db.model('orders', orderSchem);
      var orderId = parseInt(req.body.OrderId, 10);
      order.findOne({'Id': orderId}, function(err, ord){
         for (var i = 0; i < req.body.dishes.length; i++){
            ord.Order.push({
               Dish: parseInt(req.body.dishes[i], 10),
               Status: 1
            })
         }
         ord.save();
         res.send('OK');
      });
   });

   app.post('/order/readDishes', function(req, res){
      var order = db.model('orders', orderSchem);
      var orderId = parseInt(req.body.OrderId, 10);
      var dishes = db.model('dishes', dishSchem);
      order.findOne({'Id': orderId}, function(err, ord){
         var dishArr = [];
         for( var i = 0; i < ord.Order.length; i++){
            if (dishArr.indexOf(ord.Order[i].Dish)<0){
               dishArr.push(ord.Order[i].Dish);
            }
         }
         res.json(dishArr);
      });
   });
};