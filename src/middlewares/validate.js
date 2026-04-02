import { ApiError } from '../utils/ApiError.js';

/**
 * Express middleware factory: validates body/query/params with a Zod schema.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(
        ApiError.badRequest('Validation failed', result.error.flatten())
      );
    }

    const { body, query, params } = result.data;
    if (body !== undefined) req.body = body;
    if (query !== undefined) req.query = query;
    if (params !== undefined) req.params = params;
    next();
  };
}
