import { createServer } from "net";
const fs = require('fs');
const directory = '/Users/valen/Desktop/EFREI/NODEJS/myFtp/myFtp';
const users = JSON.parse(fs.readFileSync('./src/userdata.json'));

export function launch(port) {
    const server = createServer((socket) => {
        console.log("new connection.");
        socket.on("data", (data) => {
            const message = data.toString();
            const [command, ...args] = message.trim().split(" ");
            console.log(command, args);

            switch (command) {
                case "USER":
                    if (args[0] == undefined) {
                        socket.write('Error enter an username and a password.\r\n');
                        break;
                      }else{
                        socket.nameuser = args[0];
                        let result = "";
                        users.forEach(user => {
                          if (user.name === socket.nameuser){
                            socket.passuser = user.password;
                            result = '230 User logged in, proceed.\r\n';
                          }else{
                            result = '230 User not exist.\r\n';
                          }
                        });
                        socket.write(result);
                        break;
                      }
                case "TEST":
                    socket.write(`Username : ${socket.nameuser} Password : ${socket.passuser} \r\n `);
                    break;
                case "PASS":
                      if (args[0] == undefined || args[0] != socket.passuser) {
                        socket.write('Error Please enter a valid password.\r\n');
                        break;
                      }else if (args[0] == socket.passuser){
                        socket.write('331 Password valid.\r\n');
                        break;
                      }
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

    });

    server.listen(port, () => {
        console.log(`server started at localhost:${port}`);
    });
}