const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const middleware = require('../middleware/api');
const errors = require('../middleware/errors');

router.param('resource', middleware.validateResource)
router.param('id', middleware.validateId);

router.get('/:resource', (req, res, next) => {
	let controller = controllers[req.params.resource];

  controller.get(req.query.params)
    .then(results => res.json({ results }))
	  .catch(err => {
			console.error(`Error get ${resource}: ${err}`);
			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}
			return errors.sendError.InternalError(msg, res)
		})
})

// router.get('/:resource/ids', (req, res, next) => {
// 	let resource = req.params.resource;
// 	let controller = controllers[resource];
// 	if (controller == null){
// 		return res.status(400).json(defaultError)
// 	}
// 	controller.get(req.query.params).then(res => {
// 		res.json({
// 			confirmation: 'success',
// 			results: results
// 		})
// 	})
// 	.catch(err => {
// 		res.status(404).json({
// 			confirmation: 'fail',
// 			errorMessage: err
// 		})
// 	})
// })

router.get('/:resource/:id', middleware.validateUser, (req, res, next) => {
  let { id, resource } = req.params;
	let controller = controllers[resource];
	controller.getById(id)
	  .then(result => res.json({ result }))
	  .catch(err => {
			console.error(`Error get ${resource}/${id}: ${err}`);
			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

router.post('/:resource', middleware.validateUser, (req, res, next) => {
	let controller = controllers[req.params.resource]

	controller.post(req.body)
	  .then(result => res.json({ result }))
	  .catch(err => {
			console.error(`Error post ${resource}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

router.put('/:resource/:id/add', middleware.validateUser, middleware.canModifyResource, (req, res, next) => {
	let { resource, id } = req.params;
	let controller = controllers[resource];

	controller.add(id, req.body)
    .then(result => res.json({ result }))
    .catch(err => {
			console.error(`Error put ${resource}/${id}/add: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}
			return errors.sendError.InternalError(msg, res)
		})
})

router.put('/:resource/:id/remove', middleware.validateUser, middleware.canModifyResource, (req, res, next) => {
	let { resource, id } = req.params;
	let controller = controllers[resource];

  controller.remove(id, req.body)
    .then(result => res.json(result))
    .catch(err => {
			console.error(`Error put ${resource}/${id}/remove: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

router.put('/:resource/:id', middleware.validateUser, middleware.canModifyResource, (req, res, next) => {
	let { resource, id } = req.params;
	let controller = controllers[resource];

  controller.put(id, req.body)
    .then(result => res.json(result))
    .catch(err => {
			console.error(`Error put ${resource}/${id}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

router.delete('/:resource/:id', middleware.validateUser, (req, res, next) => {
  let { resource, id } = req.params;
  let controller = controllers[resource];

  controller.delete(id)
    .then(result => res.json(result))
    .catch(err => {
			console.error(`Error delete ${resource}/${id}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

module.exports = router;
