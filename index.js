const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user')
const swaggerDocs = require('./swagger')
const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/user', userRouter)


const port = 3000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
    swaggerDocs(app, port)
})
