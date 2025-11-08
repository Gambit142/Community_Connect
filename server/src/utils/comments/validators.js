const Joi = require('joi');

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'Content is required',
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content too long (max 1000 chars)'
  }),
  parentCommentId: Joi.string().allow(null).optional().messages({
    'string.base': 'Invalid parent comment ID'
  })
});

const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'Content is required',
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content too long (max 1000 chars)'
  })
});

module.exports = { createCommentSchema, updateCommentSchema };