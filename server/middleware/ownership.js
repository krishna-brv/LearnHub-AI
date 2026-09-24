const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');

/**
 * Check if current user owns the specified resource or is admin
 * @param {Object} Model - Mongoose Model
 * @param {string} [paramName='id'] - URL parameter name containing resource ID
 * @param {string} [ownerField='instructor'] - Model field containing owner user ID
 */
const checkOwnership = (Model, paramName = 'id', ownerField = 'instructor') => {
  return asyncHandler(async (req, res, next) => {
    // Platform Admin bypasses ownership checks
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      return next(new AppError(`Parameter '${paramName}' missing in request.`, 400));
    }

    const resource = await Model.findById(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    const ownerId = resource[ownerField];
    const ownerIdStr = ownerId?._id ? ownerId._id.toString() : ownerId?.toString();
    if (!ownerIdStr) {
      return next(new AppError(`Owner field '${ownerField}' not found on resource.`, 500));
    }

    // Compare string IDs
    if (ownerIdStr !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to modify or access this resource.', 403));
    }

    // Attach resource to req for reuse in controller if needed
    req.resource = resource;
    next();
  });
};

module.exports = {
  checkOwnership
};
