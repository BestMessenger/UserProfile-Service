const express = require('express')
const cassandra = require('cassandra-driver')
const router = express.Router()

const Uuid = cassandra.types.Uuid

const client = new cassandra.Client({
    // contactPoints: ["apache-cassandra"],
    contactPoints: ["localhost"],
    localDataCenter: "datacenter1",
});

const keyspace = 'userprofile_service'
const table = 'users'


async function init(){
    const create_keyspace = "CREATE KEYSPACE IF NOT EXISTS UserProfile_Service WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 3 }"
    const create_table = "CREATE TABLE IF NOT EXISTS UserProfile_Service.Users (userId INT PRIMARY KEY, username VARCHAR, password VARCHAR, contact VARCHAR, email VARCHAR, name VARCHAR, last_name VARCHAR)"
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


/**
 * @openapi
 * '/user':
 *  get:
 *     tags:
 *     - User
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  userid:
 *                    type: number
 *                    default: 1
 *                  username:
 *                    type: string
 *                    default: myusername
 *                  password:
 *                    type: string
 *                    default: secret
 *                  contact:
 *                    type: string
 *                    default: +3287382
 *                  email:
 *                    type: string
 *                    default: example@exmaple.com
 *                  name:
 *                    type: string
 *                    default: John
 *                  last_name:
 *                    type: string
 *                    default: Doe
 *
 *       400:
 *         description: Bad Request
 */

router.get('/', function(req,res){
    client.execute(get_all_users, [], function(err, result){
        if(err){
            res.status(400).send("Bad Request")
        } else {
            res.json(result.rows)
        }
    })
})

/**
 * @openapi
 * '/user':
 *  post:
 *     tags:
 *     - User
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              userid:
 *                type: number
 *                default: 2
 *              username:
 *                type: string
 *                default: tony2004
 *              password:
 *                type: string
 *                default: secret
 *              contact:
 *                type: string
 *                default: +908294718
 *              email:
 *                type: string
 *                default: example@example.com
 *              name:
 *                type: string
 *                default: Toha
 *              last_name:
 *                type: string
 *                default: Cool
 *     responses:
 *      201:
 *        description: Created
 *      400:
 *        description: Bad Request(maybe id exists in the db)
 */

router.post('/', function(req, res){
    client.execute(insert_one_user,
        [req.body.userid , req.body.username, req.body.password, req.body.contact, req.body.email, req.body.name, req.body.last_name],
        { prepare: true },
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send("Not found")
            } else {
                res.status(201).send("Created")
            }
        })

})

/**
 * @openapi
 * '/user/{userid}':
 *  put:
 *     tags:
 *     - User
 *     summary: Update a user
 *     parameters:
 *      - name: userid
 *        in: path
 *        description: The unique id of the user
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - name
 *            properties:
 *              username:
 *                type: string
 *                default: tony2004
 *              password:
 *                type: string
 *                default: secret
 *              contact:
 *                type: string
 *                default: +908294718
 *              email:
 *                type: string
 *                default: example@example.com
 *              name:
 *                type: string
 *                default: Toha
 *              last_name:
 *                type: string
 *                default: Cool
 *     responses:
 *      200:
 *        description: Created
 *      404:
 *        description: Not Found
 */


router.put('/:userid', function(req, res){
    client.execute(update_one_user,
        [req.body.username, req.body.password, req.body.contact, req.body.email, req.body.name, req.body.last_name, req.params.userid],
        { prepare: true },
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(404).send("Not found")
            } else {
                res.status(200).send("Updated")
            }
        })

})

/**
 * @openapi
 * '/user/{userid}':
 *  get:
 *     tags:
 *     - User
 *     summary: Get one users
 *     parameters:
 *      - name: userid
 *        in: path
 *        description: The unique id of the user
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userid:
 *                  type: number
 *                  default: 1
 *                username:
 *                  type: string
 *                  default: myusername
 *                password:
 *                  type: string
 *                  default: secret
 *                contact:
 *                  type: string
 *                  default: +3287382
 *                email:
 *                  type: string
 *                  default: example@exmaple.com
 *                name:
 *                  type: string
 *                  default: John
 *                last_name:
 *                  type: string
 *                  default: Doe
 *
 *       400:
 *         description: Bad Request
 */


router.get('/:userid', function(req, res){
    client.execute(get_one_user, [req.params.userid],
        { prepare: true },
        (err, result) => {
            if(err || result.rows.length == 0){
                console.log(err)
                res.status(404).send("Not found")
            } else{
                res.send(result.rows[0])
            }
        })
})

/**
 * @openapi
 * '/user/{userid}':
 *  delete:
 *     tags:
 *     - User
 *     summary: Remove user by id
 *     parameters:
 *      - name: userid
 *        in: path
 *        description: The unique id of the user
 *        required: true
 *     responses:
 *      200:
 *        description: Removed
 *      404:
 *        description: Not Found
 */

router.delete('/:userid', function(req, res){
    client.execute(delete_one_user,
        [req.params.userid],
        { prepare: true },
        (err, result) => {
            if(err){
                console.log(err)
                res.status(404).send("Not found")
            } else{
                console.log(result)
                res.send("Removed")
            }
        })
})


module.exports = router