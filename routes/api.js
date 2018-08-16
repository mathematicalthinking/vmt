const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.get('/:resource', (req, res, next) => {
	const resource = req.params.resource;
	const controller = controllers[resource];
	if (controller == null){
		return res.status(400).json({
			confirmation:'fail',
			message:'Invalid resource...check your spelling'
		})
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
		res.status(400).json({
			confirmation:'fail',
			message:'Invalid resource...check your spelling'
		})
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
  console.log(action)
	const controller = controllers[action]
  console.log('controller: ', controller)
	if (controller == null){
		return res.status(400).json({
			confirmation:'fail',
			message:'Invalid resource...check your spelling'
		})
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
		return res.json({
			confirmation:'fail',
			message:'Invalid resource...check your spelling'
		})
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

module.exports = router;
