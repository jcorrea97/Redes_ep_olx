class User {

    id;
    name;
    ratings = {
        '0 estrelas': 0,
        '1 estrelas': 0,
        '2 estrelas': 0,
        '3 estrelas': 0,
        '4 estrelas': 0,
        '5 estrelas': 0
    };

    constructor(name, socketId) {
        this.id = User.generateId();
        this.name = name
        this.socketId = socketId;
    }

    addRating(rate, userRating) {
        this.ratings[rate + ' estrelas']++;
    }

    //Id gerado automaticamente
    static generateId() {
        return Math.floor(Math.random() * 1000000000)
    }

}

class UserService {

    users = {}

    constructor() {}

    //Mantem os cookies do usuario armazenados, através do id.
    //Se nao houver nome, nada é retornado
    login(name, socketId, token) {

        if(token && this.users[token]) {
            this.users[token].socketId = socketId
            console.log('reconexão de usuário, atualizando id do socket,\n usuario de id: ' + token + '\nrecebe o socket: ' + socketId)
            return;
        }

        if(!name) {
            console.log('sem nome e não é reconexão, saindo...')
            return
        }

        const user = new User(name, socketId)

        while(this.users[user.id]) {
            user.id = User.generateId();
        }

        this.users[user.id] = user;
        return user;
    }

    getUser(id) {
        return this.users[id] || null
    }

    //Chama a funcao de avaliacao na classe User
    rateUser(userRatingId, rate, userRatedId) {
        if(this.users[userRatedId])
        this.users[userRatedId].addRating(rate, userRatingId);
    }

}

module.exports = new UserService();