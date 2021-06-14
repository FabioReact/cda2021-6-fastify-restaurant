const { db } = require('./db')
const fastify = require('fastify')({
  logger: true
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

// API REST
// GET /courses/id -> Renvoie le plat ayant l'id passé dans l'url
// POST /courses -> Ajoute un plat
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