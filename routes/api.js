const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const middleware = require('../middleware/api');
const errors = require('../middleware/errors');
const multer = require('multer');
const multerMw = require('../middleware/multer');
const _ = require('lodash');

router.param('resource', middleware.validateResource)
router.param('id', middleware.validateId);

router.get('/:resource', (req, res, next) => {
	let controller = controllers[req.params.resource];
	req.query.isTrashed = false;
  controller.get(req.query)
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

	router.get('/search/:resource/:text/:exclude', (req, res, next) => {
		let controller = controllers[req.params.resource];
		let text = req.params.text.replace(/\s+/g, "");
		let regex = new RegExp(text, 'i');
		controller.search(regex, req.params.exclude)
		.then(results => {
			res.json({ results })
		})
		.catch(err => {
			console.log(err)
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


// Bypass the middlewre for now on a temp room...eventually we should probably change the URL
// from the rooms id to some sort of secret entry code.
router.get('/:resource/:id/:tempRoom', (req, res, next) => {
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

const ggbUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerMw.ggbFileFilter,
});

router.post('/upload/ggb', middleware.validateUser, ggbUpload.array('ggbFiles', 10), (req, res, next) => {
	let bufferFiles = req.files;

	if (!Array.isArray(bufferFiles)) {
		return res.json({result: []});
	}
	let base64Files = bufferFiles.map((fileObj) => {
		let buffer = fileObj.buffer;
		if (buffer) {
			return buffer.toString('base64');
		}
	});
	let compacted = _.compact(base64Files);
	return res.json({result: compacted});
});

router.post('/:resource', middleware.validateUser, middleware.validateNewRecord, (req, res, next) => {
	let controller = controllers[req.params.resource]
	controller.post(req.body)
	  .then(result => res.json({ result }))
	  .catch(err => {
			console.error(`Error post ${req.params.resource}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		})
})

router.put('/:resource/:id/add', middleware.validateUser, (req, res, next) => {
	let { resource, id } = req.params;
	let controller = controllers[resource];

	return middleware.canModifyResource(req)
	  .then((results) => {
			let { canModify, doesRecordExist, details } = results;

			if (!doesRecordExist) {
				return errors.sendError.NotFoundError(null, res);
			}

			if (!canModify) {
				return errors.sendError.NotAuthorizedError('You do not have permission to modify this resource', res);
			}
			let prunedBody = middleware.prunePutBody(req.user, id, req.body, details)
			return controller.add(id, prunedBody)
		})
		.then((result) => res.json(result))
		.catch((err) => {
			console.error(`Error put ${resource}/${id}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		});
})

router.put('/:resource/:id/remove', middleware.validateUser, (req, res, next) => {
	let { resource, id } = req.params;
	let controller = controllers[resource];

  return middleware.canModifyResource(req)
	  .then((results) => {
			let { canModify, doesRecordExist, details } = results;

			if (!doesRecordExist) {
				return errors.sendError.NotFoundError(null, res);
			}

			if (!canModify) {
				return errors.sendError.NotAuthorizedError('You do not have permission to modify this resource', res);
			}
			let prunedBody = middleware.prunePutBody(req.user, id, req.body, details)
			return controller.remove(id, prunedBody)
		})
		.then((result) => res.json(result))
		.catch((err) => {
			console.error(`Error put ${resource}/${id}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		});
})

router.put('/:resource/:id', middleware.validateUser, (req, res, next) => {
	let { resource, id } = req.params
	let controller = controllers[resource];

	if (resource === 'events') {
		return errors.sendError.BadMethodError('Events cannot be modified!', res);
	}
	return middleware.canModifyResource(req)
	  .then((results) => {
			let { canModify, doesRecordExist, details } = results;

			if (!doesRecordExist) {
				return errors.sendError.NotFoundError(null, res);
			}

			if (!canModify) {
				return errors.sendError.NotAuthorizedError('You do not have permission to modify this resource', res);
			}
			let prunedBody = middleware.prunePutBody(req.user, id, req.body, details)
			return controller.put(id, prunedBody)
		})
		.then((result) => res.json(result))
		.catch((err) => {
			console.error(`Error put ${resource}/${id}: ${err}`);

			let msg = null;

			if (typeof err === 'string') {
				msg = err;
			}

			return errors.sendError.InternalError(msg, res)
		});
	})


router.delete('/:resource/:id', middleware.validateUser, (req, res, next) => {
	// for now delete not supported
	// add isTrashed?
	return errors.sendError.BadMethodError('Sorry, DELETE is not supported for this resource.', res);

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
