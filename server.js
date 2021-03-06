
//Creating variables to connect 
const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//Connect to Mongodb
mongo.connect('mongodb://127.0.0.1/mongochat',function(err,db)
{
    if(err)
    {
        throw err;
    }
    
    console.log('Connected.....');
    //Connect to socket.io
    client.on('connection',function(socket)
    {
        let chat = db.collection('chats');

        //Create function to send status
        sendStatus = function(s)
        {
            socket.emit('status',s);
        }

        //Get chats from Collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res)
        {
            if(err)
            {
                throw err;
            }

            //Emit messages
            socket.emit('output',res)
        });
        //Handle input events
        socket.on('input',function(data)
        {
            let name  = data.name;
            let message  = data.message;
            
            //check for name and message
            if(name==' ' || message == '')
            {
                //Send error status
                sendStatus('Please Enter a name and message');
            }
            else
            {
                //Insert message 
                chat.insert({name: name,message:message},function()
                {
                    client.emit('output',[data]);
                    //Send Status Object 
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        //Handle clear
        socket.on('clear',function(data)
        {   
            //Remove all chats from collection
            chat.remove({},function(){
                socket.emit('cleared...');
            });
        });
    });
});
