const express = require('express')
const cors = require('cors')
const userRouter = require('./user_crud_api')
const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/user', userRouter)


const port = 3000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})
