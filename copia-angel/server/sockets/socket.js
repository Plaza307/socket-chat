const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades')

const usuarios = new Usuarios();

io.on('connection', (client) => {


    client.on('entrarChat', (data, callback) => {


        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es obligatorio'
            });
        }


        client.join(data.sala);

        usuarios.agregarPersonas(client.id, data.nombre, data.sala);

        //Notificacion de quien se conecta
        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));

        callback(usuarios.getPersonasPorSala(data.sala));
    }); // conexion al chat


    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });



    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);


        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} abadono el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala)); //desconexion del chat



        //Mensajes privados // lo que hara el servidor al escuchar el mensaje
        client.on('mensajePrivado', data => {


            //con esto sabemos que persona lo esta mandando
            let persona = usuarios.getPersona(client.id);

            client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
        })
    });






});





// client.on('disconnect', () => {
//     console.log('Usuario desconectado');
// });

// // Escuchar el cliente
// client.on('enviarMensaje', (data, callback) => {

//     console.log(data);

//     client.broadcast.emit('enviarMensaje', data);


//     // if (mensaje.usuario) {
//     //     callback({
//     //         resp: 'TODO SALIO BIEN!'
//     //     });

//     // } else {
//     //     callback({
//     //         resp: 'TODO SALIO MAL!!!!!!!!'
//     //     });
//     // }



// });