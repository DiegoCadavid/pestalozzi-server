const moongose = require('mongoose');

const connectDB = () => {
    const connect = async() => {
        await moongose.connect(process.env.MONGO__DB);
    }

    connect().then(()=> {
        console.log('Base de datos conectada');
    }).catch( err => {
        console.log('Error en la conexion de la base de datos:');
        console.log(err);
    });
    
}



module.exports = connectDB;