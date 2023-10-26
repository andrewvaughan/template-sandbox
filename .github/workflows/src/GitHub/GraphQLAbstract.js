const NotImplementedError = require("../Errors/NotImplementedError");
const WorkflowAbstract = require("../WorkflowAbstract");

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
 * @abstract @class @extends WorkflowAbstract
 */
module.exports = class GraphQLAbstract extends WorkflowAbstract {
  /**
   * Fields within the GitHub GraphQL API that are primitive in nature and return their value directly.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @protected @static @readonly @type {string[]}
   */
  static _primitiveFields = [];

  /**
   * Fields mapping within the GitHub GraphQL API and their associated class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @protected @static @readonly @type {Object<string, string>}
   */
  static _manyToOneFields = {};

  /**
   * Paginated fields within the GitHub GraphQL API that and their associated primitives or class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects}
   *
   * @protected @static @readonly @type {Object<string, string>}
   */
  static _manyToManyFields = {};

  /**
   * The maximum number of items to load per-call for many-to-many relationship lookups.
   *
   * @protected @static @constant @type {int}
   */
  static _PAGINATION_COUNT = 20;

  /**
   * Cached items from GraphQL.
   *
   * @protected @type {Object<string, *>}
   */
  _cache = {};

  /**
   * A basic constructor that allows for overriding getters dynamically.
   *
   * @returns {Proxy}
   *
   * @public @constructor
   */
  constructor() {
    super();

    // Allows this to override all getters that aren't explicitly set. Copy this line into any child constructors.
    return new Proxy(this, this);
  }

  /**
   * Return whether this object contains a given field in the GitHub API reference.
   *
   * @param {string} field - the field name to lookup
   *
   * @returns {boolean} whether the field exists in this object
   *
   * @public @static
   */
  static has(field) {
    this._debugCall("has", arguments, true);

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

  /**
   * Generates a single object of this type from the given resource.
   *
   * @param {*} caller - the calling object which used to generate
   * @param {Object<string, string>} args - any other GraphQL arguments to send with the query
   *
   * @returns {*} a single instance of this object generated from the caller information
   *
   * @public @static @async
   */
  static async generate(caller, args = {}) {
    throw new NotImplementedError("Missing implementation of the `GraphQLAbstract.generate` method in child class.");
  }

  /**
   * Generates a set of objects of this type from the given resource.
   *
   * @param {*} caller - the calling object which used to generate
   * @param {int} [perPage=20] - the maximum number of elements to return
   * @param {string} [after=0] - returns the elements in the list that come after this cursor
   * @param {Object<string, string>} args - any other GraphQL arguments to send with the query
   *
   * @returns {Array} an `Array` of this object generated from the caller information
   *
   * @public @static @async
   */
  static async generateSet(caller, perPage = 20, after = undefined, args = {}) {
    throw new NotImplementedError("Missing implementation of the `GraphQLAbstract.generateSet` method in child class.");
  }

  /**
   * Get all primitive types from GitHub.
   *
   * Only loads simple primitives in this call. Anything that returns a one-to-many or many-to-many relationship is
   * implemented via a separate getter in a lazy-laoded methodology.
   *
   * @param {boolean} [force=false] - whether to force a reload from GitHub
   *
   * @return {Object<string, *>} the full response from the GraphQL API call
   *
   * @throws {GraphqlResponseError} if the GraphQL API call fails
   *
   * @override @protected @async
   */
  async _loadPrimitives(force = false) {
    throw new NotImplementedError(
      "Missing implementation of the `GraphQLAbstract._loadPrimitives` method in child class."
    );
  }

  /**
   * Clears the cache.
   *
   * @public
   */
  async clearCache() {
    this._debugCall("clearCache", arguments);

    this._cache = {};
  }

  /**
   * If not explicitly set, this looks to see if the value is in the API cache.
   *
   * This method handles all pagination and subsequent lookups in the GraphQL library as-configured by the
   * `_primitiveFields`, `_manyToOneFields` and `_manyToManyFields` configurations in this class.
   *
   * This limits paginated fetches to `_PAGINATION_COUNT` results. By default, this is 20 maximum items, but overlaoding
   * this value in a child class can change the default behavior.
   *
   * Child classes should create explicit getters or fetching functions variables that require specific capabilities,
   * such as querying or pagination.
   *
   * @example
   * Because of the asynchronous nature of this getter, all access of variables must have a prepended `await` token:
   *
   * ```js
   * let labels = await myIssue.labels;
   * ```
   *
   * @param {*} target - not used
   * @param {string} prop - the name of the property to look up
   *
   * @returns {*} a promise that resolves to the value of `prop` or `undefined` if not set
   *
   * @public @async
   */
  get(target, prop) {
    // Any variables set directly in this object take precedence
    const direct = Reflect.get(...arguments);

    if (direct) {
      this._debugCall(`GET[direct]`, { prop }, true);
      return direct;
    }

    this._debugCall("GET", { prop });

    // If a prior lookup cached the property, return the cache
    if (prop in this._cache) {
      this._logger.debug(`Lookup '${prop}' cache hit.`);
      return this._cache[prop];
    }

    this._logger.debug(`Lookup '${prop}' cache miss.`);

    // If this is a many-to-many variable, load the first `_PAGINATION_COUNT` results through the
    // defined class
    if (prop in this.constructor._manyToManyFields) {
      this._logger.debug(`Found '${prop}' in many-to-many fields.`);

      this._logger.debug(`Generating from ${this.constructor._manyToManyFields[prop].name} class.`);

      return (async () => {
        return await this.constructor._manyToManyFields[prop].generateSet(this);

      })().then((generated) => {
        this._logger.debug("Many-to-many generator complete.");
        this._logger.verbose(generated);

        this._cache[prop] = generated;
        return this._cache[prop];
      });
    }

    // If this is a one-to-many variable, load that through the defined class
    if (prop in this.constructor._manyToOneFields) {
      this._logger.debug(`Found '${prop}' in many-to-one fields.`);

      this._logger.debug(`Generating from ${this.constructor._manyToOneFields[prop].name} class.`);

      return (async () => {
        return await this.constructor._manyToOneFields[prop].generate(this);

      })().then((generated) => {
        this._logger.debug("Many-to-one generator complete.");
        this._logger.verbose(generated);

        this._cache[prop] = generated;
        return this._cache[prop];
      });
    }

    // Otherwise, the only option remaining is a primitive, so see if it can load it from there.
    if (this.constructor._primitiveFields.includes(prop)) {
      this._logger.debug(`Found '${prop}' in primitive fields.`);

      return (async () => {
        return await this._loadPrimitives();
      })().then(() => {
        if (prop in this._cache) {
          return this._cache[prop];
        }

        throw new ReferenceError(`Expected primitive '${prop}' did not load properly from GitHub API.`);
      });
    }

    // Otherwise, the property isn't recognized
    return undefined;
  }
};
