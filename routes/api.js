const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

const defaultError = {
  confirmation:'fail',
  message:'Invalid resource...check your spelling'
}


router.get('/:resource', (req, res, next) => {
	const resource = req.params.resource;
	const controller = controllers[resource];
	if (controller == null){
		return res.status(400).json(defaultError)
	}
	controller.get(req.query).then(results => {
		res.json({
	    confirmation: 'success',
	    results: results
	  })
	})
	.catch(err => {
		res.status(404).json({
			confirmation: 'fail',
			errorMessage: err
		})
	})
})
router.get('/:resource/:id', (req, res, next) => {
	const resource = req.params.resource
	const id = req.params.id
	const controller  = controllers[resource]
	if (controller == null){
		res.status(400).json(defaultError)
	}
	controller.getById(id)
	.then(result => {
		res.json({
			confirmation: 'success',
			result: result
		})
	})
	.catch(err => {
		res.status(400).json({
			confirmation: 'fail',
			message: err
		})
	})
})

router.post('/:action', (req, res, next) => {
	const action = req.params.action;
	const controller = controllers[action]
	if (controller == null){
		return res.status(400).json(defaultError)
	}
	controller.post(req.body)
	.then(result => {
		if (action == 'inquiry'){
			return res.json(result);
		}
		res.json({
			confirmation: 'success',
			result,
		})
	})
	.catch(err => {
		res.status(400).json({
			confirmation: 'fail',
			message: err
		})
	})
})

router.put('/:resource/:id', (req, res, next) => {
  const resource = req.params.resource;
	const controller = controllers[resource];
  if (controller == null){
		return res.json(defaultError)
	}
  controller.put(req.params.id, req.body)
  .then(result => {
    res.json({
      confirmation: 'success',
      result,
    });
  })
  .catch(err => {
    res.status(400).json({
      confirmation: 'fail',
      message: err,
    })
  })
})

router.delete('/:resource/:id', (req, res, next) => {
  const { resource, id } = req.params;
  const controller = controllers[resource];
  if (controller == null){
    return res.json(defaultError)
  }
  controller.delete(id)
  .then(result => {
    res.json({
      confirmation: 'success',
      result,
    });
  })
  .catch(err => {
    res.status(400).json({
      confirmation: 'fail',
      message: err,
    })
  })
})

module.exports = router;
