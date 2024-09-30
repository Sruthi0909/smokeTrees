const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'userAddress.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    userId: dbObject.user_id,
    userName: dbObject.user_name,
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    id: dbObject.id,
    userId = dbObject.user_id,
    address = dbObject.address,
  }
}

app.get('/users/', async (request, response) => {
  const getUsersQuery = `
    SELECT
      *
    FROM
      users_table;`
  const usersArray = await database.all(getUsersQuery)
  response.send(
    usersArray.map(eachPlayer => convertDbObjectToResponseObject(eachUser)),
  )
})

app.get('/users/:userId/', async (request, response) => {
  const {userId} = request.params
  const getUserQuery = `
    SELECT 
      * 
    FROM 
      users_table 
    WHERE 
      user_id = ${userId};`
  const user = await database.get(getUserQuery)
  response.send(convertDbObjectToResponseObject(user))
})

app.post('/users/', async (request, response) => {
  const {userName, userId, address} = request.body
  const postUserQuery = `
  INSERT INTO
    address (user_name, user_id,address)
  VALUES
    ('${userName}', ${userId}, '${address}');`
  const users = await database.run(postUserQuery)
  response.send('User Added')
})

app.put('/address/:userId/', async (request, response) => {
  const {userName, userId, address} = request.body
  const {userId} = request.params
  const updateUserQuery = `
  UPDATE
    address
  SET
    user_name = '${userName}',
    user_id = ${userId},
    address = '${address}'
  WHERE
    user_id = ${userId};`

  await database.run(updateUserQuery)
  response.send('User Details Updated')
})

app.delete('/users/:userId/', async (request, response) => {
  const {userId} = request.params
  const deleteUserQuery = `
  DELETE FROM
    users
  WHERE
    user_id = ${userId};`
  await database.run(deleteUserQuery)
  response.send('User address Removed')
})
module.exports = app
