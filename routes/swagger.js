const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', (req, res, next) => {
	const forwardedProto = req.get('x-forwarded-proto');
	const scheme = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
	const dynamicDoc = {
		...swaggerDocument,
		host: req.get('host'),
		schemes: [scheme]
	};

	return swaggerUi.setup(dynamicDoc)(req, res, next);
});

module.exports = router;