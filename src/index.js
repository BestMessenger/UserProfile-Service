const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user')
const swaggerDocs = require('./swagger')
const eurekaHelper = require('./eureka-helper');
const app = express()
const client = require("cloud-config-client");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/user', userRouter)

const port = 7000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
    swaggerDocs(app, port)
})

eurekaHelper.registerWithEureka('user-service', port);
