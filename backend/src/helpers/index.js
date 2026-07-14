/**
 * Common Helper Functions
 */

/**
 * Date Helpers
 */
const dateHelpers = {
  /**
   * Adds minutes to a date object.
   * @param {Date} date 
   * @param {number} minutes 
   * @returns {Date}
   */
  addMinutes: (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
  },

  /**
   * Formats a date into a standard database trace string.
   * @param {Date} date 
   * @returns {string}
   */
  toISOString: (date) => {
    return date.toISOString();
  },
};

/**
 * String Helpers
 */
const stringHelpers = {
  /**
   * Generates a random alphanumeric token string.
   * @param {number} length 
   * @returns {string}
   */
  generateRandomString: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Capitalizes the first letter of a string.
   * @param {string} str 
   * @returns {string}
   */
  capitalizeFirstLetter: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};

/**
 * Object Helpers
 */
const objectHelpers = {
  /**
   * Filters an object keeping only the permitted keys.
   * @param {Object} obj 
   * @param {Array<string>} allowedFields 
   * @returns {Object}
   */
  filterFields: (obj, allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
        newObj[el] = obj[el];
      }
    });
    return newObj;
  },

  /**
   * Removes keys with undefined/null values from an object.
   * @param {Object} obj 
   * @returns {Object}
   */
  cleanObject: (obj) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach((key) => {
      if (newObj[key] === undefined || newObj[key] === null) {
        delete newObj[key];
      }
    });
    return newObj;
  },
};

/**
 * Pagination Helpers
 */
const paginationHelpers = {
  /**
   * Generates database skip and limit options.
   * @param {number} page 
   * @param {number} limit 
   * @returns {{skip: number, limit: number}}
   */
  getPaginationOptions: (page = 1, limit = 10) => {
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));
    const skip = (p - 1) * l;
    return { skip, limit: l };
  },

  /**
   * Creates standard pagination metadata response fields.
   * @param {number} totalItems 
   * @param {number} page 
   * @param {number} limit 
   * @returns {{page: number, limit: number, totalItems: number, totalPages: number}}
   */
  createPaginationMeta: (totalItems, page = 1, limit = 10) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages: Math.max(1, totalPages),
    };
  },
};

module.exports = {
  dateHelpers,
  stringHelpers,
  objectHelpers,
  paginationHelpers,
};
