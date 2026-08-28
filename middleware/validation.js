
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, isValid] of Object.entries(schema)) {
      if (!isValid(req.body[field])) {
        errors.push(`${field} is missing or invalid`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}

function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const value = parseInt(req.params[paramName], 10);
    if (isNaN(value) || value < 1) {
      return res.status(400).json({ error: `${paramName} must be a positive integer` });
    }
    req.params[paramName] = value; 
    next();
  };
}

export { validateBody, validateIdParam };