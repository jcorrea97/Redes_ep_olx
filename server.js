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

//tela home
app.get('/home', (req, res) => {
    res.render('home.html');
});
//tela login
app.get('/', (req, res) => {
    res.render('login.html');
});

//tela chat
app.get('/chat', (req, res) => {
    res.render('salachat.html');
});
//tela para criar produto
app.get('/novoproduto', (req, res) => {
    res.render('novoproduto.html');
});
//tela login
app.post('/login', (req, res) => {
    const { name } = req.body
   
    res.cookie('userId', user.id)
    res.json(user);
})

app.all("/**", (req, res) => {
    res.render('notFound.html')
})

//lista de msg, produtos e usuarios
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

    //socket pque recebe um novo usuario
    socket.on('initUser', data => {
        const user = userService.login(data.name, socket.id, data.token)
        socket.emit('usuarioNovo', user);
    });

    //socket que recebe que o item foi comprado e apaga da lista
    socket.on('comprarproduto', data => {
        produtos.pop(data);        
    });

    //socket que recebe msangem, adiciona msg em uma lista e emite a msg na salaChat
    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data);
    });
    //socket que recebe um produto e coloca ele na lista de produtos e emit para todos conectados um novo produto
    socket.on('sendProduto', data => {
        produtos.push(data);
        socket.broadcast.emit('receivedProdutos', data);
    });

    //socket de avaliacao do usuario recebido da pagina produto
    //Chama a função que avalia o usuario na sua classe e emite o sinal de recebimento dessa avaliação
    socket.on('avaliaUsuario', data => {
        userService.rateUser(data.token, data.rate, data.userRatedId)
        userRated = userService.getUser(data.userRatedId);

        console.log(userRated)

        if(userRated)
        io.to(userRated.socketId).emit('recebeAvaliacao', userRated.ratings);
    })

});

server.listen(3000);