import {
  createServer
} from "net";
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
              case "CREATEUSER":
                  if (args[0] == undefined || args[1] == undefined) {
                      socket.write(' Please enter an username and a password.\r\n');
                  } else {
                      let flag = false;
                      users.forEach(user => {
                          if (user.nameuser === args[0]) {
                              flag = true;
                          }
                      });
                      if (flag) {
                          socket.write(`Sorry An user as already this username, please choose another username.\r\n`);
                      } else {
                          socket.nameuser = args[0];
                          socket.passuser = args[1];
                          users.push({
                              name: args[0],
                              password: args[1]
                          });
                          fs.writeFile('./src/userdata.json', JSON.stringify(users), 'utf8', function(error) {
                              if (error) {
                                  socket.write(`An error has occurred when creating the new User. Retry or connect with command USER.\r\n`);
                              } else {
                                  socket.write(`230 User ${socket.nameuser} successfully created, you will now be logged in.\r\n`);
                              }
                          });

                      }
                  }
                  break;
              case "USER":
                  if (args[0] == undefined) {
                      socket.write('Error enter an username and a password.\r\n');
                      break;
                  } else {
                      socket.nameuser = args[0];
                      let result = "";
                      users.forEach(user => {
                          if (user.name === socket.nameuser) {
                              socket.passuser = user.password;
                              result = '230 User logged in, proceed.\r\n';
                          } else {
                              result = '230 User not exist.\r\n';
                          }
                      });
                      socket.write(result);
                      break;
                  }
                  break;
              case "PASS":
                  if (args[0] == undefined || args[0] != socket.passuser) {
                      socket.write('Error Please enter a valid password.\r\n');
                      break;
                  } else if (args[0] == socket.passuser) {
                      socket.write('331 Password valid. Welcome\r\n');
                      break;
                  }
                  break;
              case "LIST":
                  fs.readdirSync(process.cwd()).forEach(file => {
                      socket.write(`${file}`);
                  });
                  break;
              case "CWD":
                  try {
                      process.chdir(args[0]);
                      socket.write(`250 New directory, ${process.cwd()} \r\n`);
                  } catch (err) {
                      socket.write(`non-existent file, try another path \r\n`)
                  }
                  break;
              case "PWD":
                  socket.write(`257, ${process.cwd()} \r\n`);
                  break;
              case "RETR":
                  socket.write("150 File status okay; about to open, data connection \r\n");
                  break;
              case "STOR":
                  socket.write("125 \r\n");
                  break;
              case "HELP":
                    socket.write(`214, \n list of all functions.\n`+
                    ` CREATEUSER [username] [password] : Create a new User.\n`+
                    ` USER [username] : Connect with a username.\n`+
                    ` PASS [password] : Authenticate the user with a password.\n`+
                    ` LIST : List the current directory of the server.\n`+
                    ` PWD : Display the name of the current directory of the server.\n`+
                    ` CWD [directory] : Change the current directory of the server.\n`+
                    ` RETR [filename] : Transfer a copy of the file FILE from the server to the client.\n`+
                    ` STOR [filename] : Transfer a copy of the file FILE from the client to the server.\n`+
                    ` QUIT : Close the connection and stop the program.\n`);
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