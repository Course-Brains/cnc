const fs = require("fs")
const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)

const command_arguments = process.argv

// Loading the game logic from logic.js
fs.readFile("logic.js", (err, data) => {
    if (err) {
        console.error("Failed to load logic.js")
        // without logic.js, the server will crash eventually anyway, better to crash here
        // Also, this function is supposed to not exist, that is how we are crashing it
        will_panic()
    }
    // be VERY careful that logic.js is the correct file because this will run it
    eval(data.toString())
})

// Default port is localhost
var port = 80
// Not secured by default
var admin_pass = null

for(let i = 2; i < command_arguments.length; i+= 2) {
    let args = command_arguments
    let value = args[i+1]
    if (args[i] == "port") {
        var port = value
        continue
    }
    if (args[i] == "pwd") {
        var admin_pass = value
        continue
    }
}

app.get("/logic.js", (_request, response) => {
    fs.readFile("logic.js", (err, data) => {
        if (err) {
            response.writeHead(500, {"Content-Type":"text/plain"})
            return response.end("500 Error getting file")
        }
        response.writeHead(200, {"Content-Type":"text/javascript"})
        response.write(data)
        return response.end()
    })
})
app.get("/admin/:pwd", (request, response) => {
    if (admin_pass) {
        if (admin_pass != request.params.pwd) {
            // Incorrect password
            response.writeHead(401, {"Content-Type":"text/plain"})
            return response.end("401 unauthorized")
        }
        // Correct password
        fs.readFile("admin.html", (err, data) => {
            if (err) {
                // Error reading file
                response.writeHead(500, {"Content-Type":"text/plain"})
                return response.end("500 Error getting file")
            }
            // Correct password & good file
            response.writeHead(200, {"Content-Type":"text/html"})
            response.write(data)
            return response.end()
        })
    }
    // If password is not set, redirects to normal /admin
    response.redirect(307, "/admin")
})
// When admin is unsecure, there is no reason to type out the password
app.get("/admin", (_request, response) => {
    if (admin_pass) {
        response.writeHead(401, {"Content-Type":"text/plain"})
        return response.end("401 unauthorized")
    }
    fs.readFile("pages/admin.html", (err, data) => {
        if (err) {
            response.writeHead(500, {"Content-Type":"text/plain"})
            return response.end("500 Error getting file")
        }
        response.writeHead(200, {"Content-Type":"text/html"})
        response.write(data)
        return response.end()
    })
})
app.get("/", (_request, response) => {
    fs.readFile("pages/index.html", (err, data) => {
        if (err) {
            response.writeHead(500, {"Content-Type":"text/plain"})
            return response.end("500 Error getting file")
        }
        response.writeHead(200, {"Content-Type":"text/html"})
        response.write(data)
        return response.end()
    })
})

server.listen(port, () => {
    console.log("server running on port " + port)
    if (admin_pass) {
        console.log("Admin password is: " + admin_pass)
    }
})