const axios = require('axios')
const express = require('express')
const router = express.Router()
router.get('/', (req, res, next) => {
  console.log('getyting Desoms')
	axios({
    method: 'GET',
    url: "https://www.desmos.com/calculator/r7uuazp5ow",
    headers: {'Accept': 'application/json'}
  })
  .then(result => {
    console.log(result.data)
		res.json({
	    confirmation: 'success',
	    result: result.data
	  })
	})
	.catch(err => {
    console.log(err)
		res.status(404).json({
			confirmation: 'fail',
			errorMessage: err
		})
	})
})


module.exports = router;
