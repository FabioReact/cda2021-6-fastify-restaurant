const { db } = require('./db')
const fastify = require('fastify')({
  logger: true
})
const { ObjectId } = require('mongodb')

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
  const collection = fastify.mongo.db.collection('courses')
  const result = await collection.find().toArray()
  return result
})

// Documentation AJV (validation): https://ajv.js.org/guide/getting-started.html
const postCourseBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    image: { type: 'string' },
    description: {
      type: 'string',
      minLength: 100,
      maxLength: 1000,
    },
    price: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
    popular: {
      type: 'boolean',
      default: true,
    },
    categories: {
      type: 'array',
      maxItems: 9,
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['asian', 'spicy', 'burger', 'fish', 'veggie', 'vegan', 'desert', 'italian', 'mexican', 'healthy', 'beverage', 'salad'],
      },
      default: [],
    }
  },
  required: ['name', 'image', 'description', 'price'],
  additionalProperties: false,
}

// POST /courses -> Ajout d'un nouveau plat
fastify.post('/courses', { schema: { body: postCourseBody } }, async (request, reply) => {
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

// GET /courses/id -> Renvoie le plat ayant l'id passé dans l'url
fastify.get('/courses/:id', async (request, reply) => {
  const id = request.params.id
  const collection = fastify.mongo.db.collection('courses')
  const result = await collection.findOne({
    _id: ObjectId(id)
  })
  return result
})

// DELETE /courses/id -> Supprime le plat ayant l'id passé dans l'url
fastify.delete('/courses/:id', async (request, reply) => {
  const { id } = request.params
  const collection = fastify.mongo.db.collection('courses')
  // Documentation: https://docs.mongodb.com/realm/mongodb/actions/collection.findOneAndDelete/
  const result = await collection.findOneAndDelete({
    _id: ObjectId(id)
  })
  // reply.code(200).send(result)
  return result
})

// PATCH /courses/id -> Modifie le plat (écrase SEULEMENT les données spécifiés) ayant l'id passé dans l'url
fastify.patch('/courses/:id', async (request, reply) => {
  const collection = fastify.mongo.db.collection('courses')
  const { id } = request.params
  const query = {_id: ObjectId(id)}
  const update = {$set: request.body}
  const options = {returnOriginal: false}
  // Documentation: https://docs.mongodb.com/realm/mongodb/actions/collection.findOneAndUpdate/
  const result = await collection.findOneAndUpdate(query, update, options)
  return result
})

// API REST
// PUT /courses/id -> Modifie le plat (en écrasant toutes les données) ayant l'id passé dans l'url

const start = async () => {
  try {
    await fastify.listen(4000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()