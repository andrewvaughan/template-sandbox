/**
 * GraphQLAbstract.
 *
 * @classdesc
 * Implements shared methods used by this library to interact with the GitHub GraphQL API.
 *
 * @see {@link https://docs.github.com/en/rest/issues}
 * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 * @abstract
 */
module.exports = class GraphQLAbstract {
  /**
   * Fields within the GitHub GraphQL API that are primitive in nature and return their value directly.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @type {string[]}
   *
   * @protected
   * @readonly
   * @static
   */
  static _primitiveFields = [];

  /**
   * Fields mapping within the GitHub GraphQL API and their associated class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @type {Object<string, string>}
   *
   * @protected
   * @readonly
   * @static
   */
  static _manyToOneFields = {};

  /**
   * Paginated fields within the GitHub GraphQL API that and their associated primitives or class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @type {Object<string, string>}
   *
   * @protected
   * @readonly
   * @static
   */
  static _manyToManyFields = {};

  /**
   * Cached items from GraphQL.
   *
   * @type {Object<string, *>}
   *
   * @protected
   */
  _cache = {};

  /**
   * Return whether this object contains a given field in the GitHub API reference.
   *
   * @param {string} field - the field name to lookup
   *
   * @returns {boolean} whether the field exists in this object
   *
   * @static
   * @public
   */
  static has(field) {
    if (this._primitiveFields.includes(field)) {
      return true;
    }

    if (field in this._manyToOneFields) {
      return true;
    }

    if (field in this._manyToManyFields) {
      return true;
    }

    return false;
  }
};
