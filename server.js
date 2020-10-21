const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userService = require('./user');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cookieParser("1234"));
app.use(bodyParser.json())


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

app.post('/login', (req, res) => {
    const { name } = req.body
   
    res.cookie('userId', user.id)
    res.json(user);
})

app.all("/**", (req, res) => {
    res.render('notFound.html')
})

let messages = [];

let produtos = [];

var user = [];

sameConnectionPool = {};


//socket.emit = mandar mensagem para o socket
//socket.on = ouvir uma mensagem
// socket.broadcast.emit = envia para todo mundo
io.on('connection', socket =>{

    // Sempre que houver uma conexão, ele vai pegar o campo token do handshake, e vai tentar meio que relogar o usuário
    // A identificação é sempre pelo id do usuário, a gente recebe ele pelo cookie que chega do backend
    // Esse ID que recebemos pelo cookie faz o socket.io meio que pegar essa conexão nova e assinalar a um usuário logado
    // Permitindo por exemplo, o usuário que postou um produto ser identificado pelo seu ID, e em qualquer tela que estiver
    // Dessa forma conseguimos mandar mensagem a um usuario onde quer que ele esteja através do seu ID gerenciado pelo UserService
    userService.login('', socket.id, socket.handshake.query && socket.handshake.query.token)
    
    console.log(`novo usuario conectado : ${socket.id}`);
    //id.push(socket.id);
    socket.emit('previousMessages', messages );
    socket.emit('previousprodutos', produtos );
    socket.emit('usuario', user);

    socket.on('initUser', data => {
        const user = userService.login(data.name, socket.id, data.token)
        socket.emit('usuarioNovo', user);
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

    socket.on('avaliaUsuario', data => {
        userService.rateUser(data.token, data.rate, data.userRatedId)
        userRated = userService.getUser(data.userRatedId);

        console.log(userRated)

        if(userRated)
        io.to(userRated.socketId).emit('recebeAvaliacao', userRated.ratings);
    })

});

server.listen(3000);