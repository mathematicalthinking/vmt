const axios = require('axios');
const express = require('express');

const router = express.Router();
const errors = require('../middleware/errors');

// Note: teacher.desmos.com redirects to classroom.amplify.com
// We try both URLs for backward compatibility
const DESMOS_ACTIVITY_BASE_URL =
  'https://teacher.desmos.com/activitybuilder/export/';
const AMPLIFY_ACTIVITY_BASE_URL =
  'https://classroom.amplify.com/activitybuilder/export/';

// Endpoint for fetching Desmos activity configurations
router.get('/activity/:code', async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Activity code is required' });
  }

  try {
    // Try with maxRedirects to follow the redirect from teacher.desmos.com to classroom.amplify.com
    const result = await axios({
      method: 'GET',
      url: `${DESMOS_ACTIVITY_BASE_URL}${code}`,
      headers: { Accept: 'application/json' },
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    // If we got a 404 from the redirected URL, the activity might not exist
    if (result.status === 404) {
      return res.status(404).json({
        config: null,
        status: 404,
        error:
          'Activity not found. The activity may have been deleted or the code may be invalid.',
      });
    }

    if (result.status !== 200) {
      return res.status(result.status).json({
        config: null,
        status: result.status,
        error: `Unexpected status: ${result.status}`,
      });
    }

    res.json({
      config: result.data,
      status: result.status,
    });
  } catch (err) {
    console.error('Error fetching Desmos activity:', err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      config: null,
      status,
      error: err.message,
    });
  }
});

// Legacy endpoint for backward compatibility
router.get('/', (req, res) => {
  axios({
    method: 'GET',
    url: req.query.url,
    headers: { Accept: 'application/json' },
  })
    .then((result) => {
      res.json({
        result: result.data,
      });
    })
    .catch((err) => {
      console.log(err);
      return errors.sendError.InternalError(null, res);
    });
});

module.exports = router;
