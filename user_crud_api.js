const express = require('express')
const cassandra = require('cassandra-driver')
const router = express.Router()

const Uuid = cassandra.types.Uuid

const client = new cassandra.Client({
    contactPoints: ["127.0.0.1"],
    localDataCenter: "datacenter1",
});

const keyspace = 'userprofile_service'
const table = 'users'


async function init(){
    const create_keyspace = "CREATE KEYSPACE IF NOT EXISTS UserProfile_Service WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 3 }"
    const create_table = "CREATE TABLE IF NOT EXISTS UserProfile_Service.Users (userId UUID PRIMARY KEY, username VARCHAR, password VARCHAR, contact VARCHAR, email VARCHAR, name VARCHAR, last_name VARCHAR)"
    await client.execute(create_keyspace, [])
    await client.execute(create_table, [])
}

init()

client.connect(function(err, result){
    if(err)
        console.log({"err": err})
    else
        console.log("Cassandra connected")
})

const get_all_users = `SELECT * FROM ${keyspace}.${table}`
const insert_one_user = `INSERT INTO ${keyspace}.${table} (userId, username, password, contact, email, name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`
const get_one_user = `SELECT * FROM ${keyspace}.${table} WHERE userId = ?`
const delete_one_user = `DELETE FROM ${keyspace}.${table} WHERE userId = ?`
const update_one_user = `UPDATE ${keyspace}.${table} SET username = ?, password = ?, contact = ?, email = ?, name = ?, last_name = ? WHERE userid = ?`

router.get('/', function(req,res){
    client.execute(get_all_users, [], function(err, result){
        if(err){
            res.status(404).send({msg: err})
        } else {
            res.json(result.rows)
        }
    })
})


router.post('/', function(req, res){
    var id = Uuid.random()
    client.execute(insert_one_user,
                   [id , req.body.username, req.body.password, req.body.contact, req.body.email, req.body.name, req.body.last_name],
                   { prepare: true },
                   (err, result) => {
                       if (err) {
                           console.log(err)
                           res.status(404).send("Not found")
                           } else {
                               console.log('User added')
                               console.log(result)
                               res.status(200).send({ success: true })
                           }
                   })

})

router.put('/:userUuid', function(req, res){
    var id = Uuid.random()
    client.execute(update_one_user,
                   [req.body.username, req.body.password, req.body.contact, req.body.email, req.body.name, req.body.last_name, req.params.userUuid],
                   { prepare: true },
                   (err, result) => {
                       if (err) {
                           console.log(err)
                           res.status(404).send("Not found")
                           } else {
                               console.log('User updated')
                               console.log(result)
                               res.status(200).send({ success: true })
                           }
                   })

})


router.get('/:userUuid', function(req, res){
    client.execute(get_one_user, [req.params.userUuid],
                   { prepare: true },
                   (err, result) => {
                       if(err || result.rows.length == 0){
                           console.log(err)
                           res.status(404).send("Not found")
                       } else{
                           console.log(result)
                           res.send(result.rows[0])
                       }
                   })
})

router.delete('/:userUuid', function(req, res){
    client.execute(delete_one_user,
                   [req.params.userUuid],
                   { prepare: true },
                   (err, result) => {
                       if(err){
                           console.log(err)
                           res.status(404).send("Not found")
                       } else{
                           console.log(result)
                           res.send("success")
                       }
                   })
})


module.exports = router
