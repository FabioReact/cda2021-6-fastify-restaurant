const { ObjectId } = require('mongodb')
const argon2 = require('argon2')

async function routes(fastify, options, done) {
	const collection = fastify.mongo.db.collection('users')

	fastify.post('/login', async (request, reply) => {
		const { email, password } = request.body
		const user = await collection.findOne({ email: email })
		if (!user) throw new Error('Mauvais email et/ou mot de passe')
		const match = await argon2.verify(user.password, password)
		if (!match) throw new Error('Mauvais email et/ou mot de passe')
		return "Welcome"
	})
}

module.exports = routes