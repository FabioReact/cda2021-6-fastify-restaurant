const { ObjectId } = require('mongodb')
const argon2 = require('argon2')

async function routes(fastify, options, done) {
	const collection = fastify.mongo.db.collection('users')

	// GET All
	fastify.get('/users', async (request, reply) => {
		const results = collection.find().toArray()
		return results
	})

	// GET by id
	fastify.get('/users/:id', async (request, reply) => {
		const { id } = request.params
		try {
			const result = await collection.findOne({_id: ObjectId(id)})
			console.log(result)
			if (!result) {
				return new Error('No document found')
			}
			return result
		} catch {
			throw new Error('Wrond ID provided')
		}
	})

	// POST
	const postUser = {
		type: 'object',
		properties: {
			email: {type: 'string'},
			password: {type: 'string', minLength: 6, maxLength: 25},
			username: {type: 'string'},
			firstname: {type: 'string'},
			lastname: {type: 'string'},
			age: {type: 'integer', minimum: 0, maximum: 130},
		},
		required: ['email', 'username', 'password'],
		additionalProperties: false,
	}

	fastify.post('/users', { schema: { body: postUser } }, async (request, reply) => {
		const hashedPassword = await argon2.hash(request.body.password)
		const newUser = {
			...request.body,
			password: hashedPassword
		}
		const result = await collection.insertOne(newUser)
		return result
	})

	// PATCH
	const patchUser = {
		type: 'object',
		properties: {
			email: {type: 'string'},
			password: {type: 'string', minLength: 6, maxLength: 25},
			username: {type: 'string'},
			firstname: {type: 'string'},
			lastname: {type: 'string'},
			age: {type: 'integer', minimum: 0, maximum: 130},
		},
		additionalProperties: false,
	}

	fastify.patch('/users/:id', { schema: { body: patchUser } }, async (request, reply) => {
		const { id } = request.params
		const query = { _id: ObjectId(id) }
		const newUser = {
			...request.body,
		}
		if (request.body.password) {
			const hashedPassword = await argon2.hash(request.body.password)
			newUser.password = hashedPassword
		}
		const update = { $set: newUser }
		const options = { returnOriginal: false }
		const result = await collection.findOneAndUpdate(query, update, options)
		return result
	})

	// DELETE
	fastify.delete('/users/:id', async (request, reply) => {
		const { id } = request.params
		const result = await collection.findOneAndDelete({ _id: ObjectId(id) })
		return result
	})
}

module.exports = routes