const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.get('/home', (req, res) => {
    res.render('home.html');
});

app.get('/', (req, res) => {
    res.render('login.html');
});


app.get('/chat', (req, res) => {
    res.render('salachat.html');
});

app.get('/novoproduto', (req, res) => {
    res.render('novoproduto.html');
});

let messages = [];

let produtos = [];

var user =[];


//socket.emit = mandar mensagem para o socket
//socket.on = ouvir uma mensagem
// socket.broadcast.emit = envia para todo mundo
io.on('connection', socket =>{
    console.log(`novo usuario conectado : ${socket.id}`);
    //id.push(socket.id);
    socket.emit('previousMessages', messages );
    socket.emit('previousprodutos', produtos );
    socket.emit('usuario', user);

    socket.on('initUser', data => {
        user.push(data);
        socket.emit('usuarioNovo', data);
    });

    socket.on('comprarproduto', data => {
        produtos.pop(data);        
    });


    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data);
    });

    socket.on('sendProduto', data => {
        produtos.push(data);
        socket.broadcast.emit('receivedProdutos', data);
    });

});

server.listen(3000);