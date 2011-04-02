////////////////////////////////////////////////
// Dependencies
////////////////////////////////////////////////

var express = require('express'),
    app = module.exports = express.createServer(),
    mongoose = require('mongoose');
    
////////////////////////////////////////////////
// Configuration
////////////////////////////////////////////////

app.register('.haml', require('hamljs'));

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'haml')
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////
var db      = mongoose.connect('mongodb://localhost/test'),
    Schema  = mongoose.Schema;
    
mongoose.model('Item', new Schema({
  name:  String,
  price: Number
}));

var Item = mongoose.model('Item');

////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////

app.get('/items', function(req, res) {
  Item.find({}, function(err, items) {
    res.render('index', {
      items: items
    });
  });
});

app.get('/items/new', function(req, res) {
  res.render('new');
});

app.post('/items/new', function(req, res) {
  var newItem   = new Item(req.body.item);
  newItem.save(function(err) {
    if(!err) {
      console.log("Success!");
    } else {
      console.log(err);
    }
    res.redirect("/items");
  });
});

app.get('/items/:id/edit', function(req, res) {
  Item.findById(req.params.id, function(err, item) {
    res.render('edit', { item: item });
  });
});

app.put('/items/:id', function(req, res) {
  Item.findById(req.params.id, function(err, item) {
    if(!err) {
      item.name  = req.body.item.name;
      item.price = parseFloat(req.body.item.price);
      item.save(function(err) {
        if(!err) {
          console.log("Success!");
        } else {
          console.log(err);
        }
      }); 
    } else {
      console.log(err);
    }
    res.redirect("/items")
  });
});

app.del('/items/:id', function(req, res) {
  Item.findById(req.params.id, function(err, item) {
    if(!err) {
      item.remove(function(err) {
        if(!err) {
          console.log("Success!");
        } else {
          console.log(err);
        }
        res.redirect("/items");
      });
    } else {
      console.log(err);
    }
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
