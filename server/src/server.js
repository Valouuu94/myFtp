import { createServer } from "net";
const fs = require('fs');
const directory = '/Users/valen/Desktop/EFREI/NODEJS/myFtp/myFtp';

export function launch(port) {
    const server = createServer((socket) => {
        console.log("new connection.");
        socket.on("data", (data) => {
            const message = data.toString();
            const [command, ...args] = message.trim().split(" ");
            console.log(command, args);

            switch (command) {
                case "USER":
                    socket.write("230 User logged in, proceed.\r\n");
                    break;
                case "PASS":
                    socket.write("331 User name ok, need pass\r\n");
                    break;
                case "LIST":
                    socket.write("125 Data connection already open; transfer starting\r\n");
                    break;
                case "CWD":
                    try{

                    process.chdir(args[0]);
                    socket.write(`250 New directory, ${process.cwd()} \r\n`);
                    } catch(err) {
                        socket.write(`non-existent file, try another path \r\n`)
                    break;
                    }
                case "RETR":
                    socket.write("150 File status okay; about to open, data connection \r\n");
                    break;
                case "STOR":
                    socket.write("125 \r\n");
                    break;
                case "PWD":
                    socket.write(`257, ${process.cwd()} \r\n`);
                    break;
                case "HELP":
                    socket.write(`211, \r\n`);
                    break;
                case "QUIT":
                    socket.write(`221 \r\n`);
                    socket.destroy();
                    break;
                default:
                    socket.write('command not supported:');
            }
        });

        socket.write("220 Hello World \r\n");
    });

    server.listen(port, () => {
        console.log(`server started at localhost:${port}`);
    });
}