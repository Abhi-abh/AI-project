const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ success: false, message: messages[0], errors: messages });
    }
    next(error);
  }
};

module.exports = validate;
