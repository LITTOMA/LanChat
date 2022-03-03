const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const host = '0.0.0.0'
const port = 3001;

// Admin key is a 16 digit hex string
const adminKey = Math.random().toString(16).substring(2, 18);
// User key is a 8 digit hex string
const userKey = Math.random().toString(16).substring(2, 10);
console.log(`Admin key: ${adminKey}`);
console.log(`User key: ${userKey}`);


/// --- API --- ///
var chats = [
    // plain text message
    { 'id': 1, 'type': 'text/plain', 'message': 'hello world' },

    // file message
    { 'id': 2, 'type': 'application/octet-stream', 'message': '/files/path/to/file.txt' },

    // image message
    { 'id': 3, 'type': 'image/png', 'message': '/files/path/to/image.png' },
];

var files = [
    { 'chatid': 1, 'path': '/files/path/to/file.txt' },
    { 'chatid': 2, 'path': '/files/path/to/image.png' },
];

function error(status, msg) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

function chatId() {
    return Math.random().toString(16).substring(2, 10);
}

function addChat(chat) {
    chat.id = chatId();
    // insert to the beginning of the array
    chats.unshift(chat);
}

app.use(express.json());
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 * 1024 },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', function (req, res, next) {
    var key = req.query['k'];

    // key is not defined
    if (!key) {
        return next(error(400, 'key is not defined'));
    }

    // key is not valid
    if (key !== adminKey && key !== userKey) {
        // return auth error
        return next(error(401, 'key is not valid'));
    }

    // key is valid
    req.key = key;
    next();
});

app.get('/api/admin', function (req, res, next) {
    // key is not valid
    if (req.key !== adminKey) {
        res.json({
            'userKey': userKey
        })
    }
    else {
        // get ip address of network interface
        var ifaces = require('os').networkInterfaces();
        var ip = '';
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4' && details.address !== '') {
                    ip = details.address;
                }
            });
        }

        res.json({
            'userKey': userKey,
            'joinUrl': `http://${ip}:${port}/?k=${userKey}`
        });
    }
});

// example: http://localhost:3000/api/chats?k=adminKey
app.get('/api/chats', function (req, res, next) {
    res.send(chats.filter(function (chat) {
        // return chats where progress is 100
        return chat.progress === 100;
    }));
});

// example: http://localhost:3000/api/chats/{chatid}?k=adminKey
app.get('/api/chats/:id', function (req, res, next) {
    var id = req.params.id;
    var chat = chats.find(function (chat) {
        return chat.id === id;
    });

    if (!chat) {
        return next(error(404, 'chat not found'));
    }

    res.send(chat);
});

app.post('/api/chats', function (req, res, next) {
    var chat = req.body;

    // chat is not defined
    if (!chat) {
        return next(error(400, 'chat is not defined'));
    }

    // chat message type is not defined
    if (!chat.type) {
        return next(error(400, 'chat message type is not defined'));
    }

    // chat message type is not valid
    if (chat.type !== 'text/plain' && chat.type !== 'application/octet-stream') {
        return next(error(400, 'chat message type is not valid'));
    }

    chat.progress = 0;
    if (chat.type === 'text/plain') {
        chat.progress = 100;
    }

    // save the chat message
    addChat(chat);
    res.send(chat);
});

app.delete('/api/chats/:id', function (req, res, next) {
    // only the admin can delete a chat
    if (req.key !== adminKey) {
        return next(error(401, 'only the admin can delete a chat'));
    }

    var id = req.params.id;
    console.log(`deleting chat ${id}`);
    var chat = chats.find(function (c) {
        return c.id == id;
    });

    if (!chat) {
        return next(error(404, 'chat not found'));
    }

    chats = chats.filter(function (c) {
        return c.id != id;
    });

    if (chat.type === 'application/octet-stream') {
        var file = files.find(function (f) {
            return f.chatid == id;
        });

        if (file) {
            files = files.filter(function (f) {
                return f.chatid != id;
            });

            // delete the file from the system temp directory
            require('fs').unlink(file.path, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    res.send(chat);
});

app.get('/api/files/:id', function (req, res, next) {
    var id = req.params.id;
    var fileChat = chats.find(function (chat) {
        return chat.id === id;
    });

    if (!fileChat) {
        return next(error(404, 'file not found'));
    }

    var file = files.find(function (f) {
        return f.chatid === id;
    });

    if (!file) {
        return next(error(404, 'file not found'));
    }

    res.download(file.path, fileChat.message);
});

app.post('/api/files/:id', function (req, res, next) {
    var id = req.params.id;
    var fileChat = chats.find(function (chat) {
        return chat.id === id;
    });

    if (!fileChat) {
        return next(error(404, 'file not found'));
    }

    var file = req.files.file;
    var path = require('path');
    var newPath = path.join(__dirname, './', 'files', `${id}.${file.name}`);
    file.mv(newPath, function (err) {
        if (err) {
            return next(err);
        }

        // save the file path
        files.push({
            'chatid': id,
            'path': newPath
        });

        fileChat.progress = 100;
        res.send(fileChat);
    });
});


// middleware to handle errors
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({ error: err.message });
});


/// --- Web --- ///
app.use(express.static('../web/dist'));


app.listen(port, host, () => {
    console.log(`Open http://${host}:${port}/?k=${adminKey} to view the chat app.`);
})