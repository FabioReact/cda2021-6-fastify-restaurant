const { db } = require('./db')
const fastify = require('fastify')({
  logger: true
})

// Connexion à la base de données
fastify.register(require('fastify-mongodb'), {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  url: 'mongodb://localhost:27017/fastify-restaurant'
})

// Déclaration des routes
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Créer une route /me qui renverrai l'objet suivant:
fastify.get('/me', async () => {
	const me = {
		id: 1,
		firstname: 'Tony',
		lastname: 'Stark',
		email: 'tony@stark.com'
	}
	return me
})

// GET /courses -> Renvoie tout les plats
fastify.get('/courses', async () => {
  return db.courses
})

// POST /courses -> Ajout d'un nouveau plat
fastify.post('/courses', async (request, reply) => {
  console.log(request.body)
  /**
   * Grâce à fastify-mongodb, on a acces à notre BDD via fastify.mongo.db
   * Cependant, il faut aussi préciser à quellle collection on souhaite avoir acces via fastify.mongo.db.collection('nom-de-la-collection')
   */
  const db = fastify.mongo.db
  const collection = db.collection('courses')
  /**
   * collection.insertOne() est une méthode qui me permet d'insérer des nouveaux élements dans la collection choisie
   * Documentation: https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne
   */
  const result = await collection.insertOne(request.body)
  return result
})

// API REST
// GET /courses/id -> Renvoie le plat ayant l'id passé dans l'url
// PUT /courses/id -> Modifie le plat (en écrasant toutes les données) ayant l'id passé dans l'url
// PATCH /courses/id -> Modifie le plat (écrase SEULEMENT les données spécifiés) ayant l'id passé dans l'url
// DELETE /courses/id -> Supprime le plat ayant l'id passé dans l'url

const start = async () => {
  try {
    await fastify.listen(4000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()