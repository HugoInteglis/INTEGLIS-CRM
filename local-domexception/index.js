// Modern Node.js/browsers have native DOMException globally available.
// This local module clean-room stub replaces the deprecated node-domexception register module
// to silence deprecation warnings.

module.exports = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || 'DOMException';
  }
};
