import { createConnection } from "net";
import { createInterface } from "readline";

let currentCommand = '';
let isAuthenticated = false;
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});
const client = createConnection({ port: 4242 }, () => {
    console.log("client connected.");
    console.log("Use command USER for connect");

    rl.question('tapper commande :', function(cmd) {
        client.write(cmd)

    })


    client.on("data", (data) => {
        const message = data.toString();
        console.log("Message received:", message);
        rl.question('tapper commande :', function(cmd) {
            client.write(cmd)
        })
        const [status, ...args] = message.trim().split(" ");
        if (status == 230 && currentCommand === "USER") {
            isAuthenticated = true;
        }

                if (status == 221) {
                    console.log("Client will now close")
                    process.exit();
                }  
    });
});