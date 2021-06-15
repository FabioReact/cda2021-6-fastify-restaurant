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

// Il faudra créer des nouvelles routes:
// GET /users
// GET /users/id
// POST /users
// PATCH /users/id
// DELETE /users/id
// Un user doit avoir les champs suivants:
// email (requis)
// username (requis)
// password (requis)
// age (optionnel)
// firstname (optionnel)
// lastname (optionnel)

// Importation des routes
fastify
  .register(require('./routes/courses'))
  .register(require('./routes/users'))
  .register(require('./routes/authentication'))

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

const start = async () => {
  try {
    await fastify.listen(4000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()