const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
const Logger = require("../Logger");
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
   * Fields mapped from the GitHub API with the function used to typecast or generate the resulting data into an
   * instantiated object.
   *
   * @example
   * ```js
   * static _fields = {
   *  name: String,            // Primitive typecast, provide the function
   *  updatedAt: Date.parse,   // Generator, provide the function
   *  author: Actor,           // One-to-many factory, provide the GraphQLAbstract class name
   *  comments: Comment,       // Many-to-many factory, provide the GraphQLAbstract class name
   * };
   * ```
   *
   * This doesn't store information about mutability, nullability, etc. of the fields in question. The GitHub API
   * returns errors on mutating these fields, if any.
   *
   * @protected @static @constant @type {Object<String, Function>}
   */
  static _fields = {};

  /**
   * The number of items to return per-page when generating this object.
   *
   * @protected @static @constant @type {Number}
   */
  static _PAGE_SIZE = 20;

  /**
   * Cached items from GraphQL.
   *
   * @protected @type {Object<String, *>}
   */
  _cache = {};

  /**
   * A basic constructor that allows for overriding getters dynamically.
   *
   * @returns {Proxy} representing this object, allowing for advanced getters and setters
   *
   * @public @constructor
   */
  constructor() {
    super();

    // Allows this to override all getters that aren't explicitly set. Copy this line into any child constructors.
    return new Proxy(this, this);
  }

  /**
   * Create this item, or a set of this items, given data from a GraphQL API response.
   *
   * @param {GraphQLAbstract} caller - the calling class used to generate the data
   * @param {Number} [pageSize=GraphQLAbstract._PAGE_SIZE] - the number of responses to return, for a set
   *
   * @returns {GraphQLAbstract|GraphQLAbstract[]} the item, or items, generated from this data
   *
   * @public @static @async
   */
  static async create(caller, pageSize = GraphQLAbstract._PAGE_SIZE) {
    this._debugStaticCall(this.name, "create", arguments);

    throw new NotImplementedError(`Missing implementation of the \`${this.name}.create\` static method.`);
  }

  /**
   * Build this item from an already-processed set of values generated from a GitHub API call.
   *
   * @param {Object<String, *>} data - the data from the API call to build from
   * @param {Boolean} [ignoreAdditional=true] - whether to ignore unmapped data types that appear in the results
   *
   * @throws {ReferenceError} if a required field is missing from `dat`
   * @throws {ReferenceError} when encountering an unexpected data type and `ignoreAdditional` is `false`
   */
  static async _build(data, ignoreAdditional = true) {
    this._debugStaticCall(this.name, "_build", arguments);

    throw new NotImplementedError(`Missing implementation of the \`${this.name}._build\` static method.`);
  }

  /**
   * Return fields not mapped to GraphQLAbstract objects.
   *
   * @returns {String[]} the primitive fields for the object
   */
  static _getPrimitiveFields() {
    const logger = new Logger(`[C]${this.name}`);
    this._debugStaticCall(this.name, "_getPrimitiveFields", arguments, false, logger);

    logger.debug(`Building Primitive field set for ${this.name}...`);

    let fields = [];

    for (const [field, func] of Object.entries(this._fields)) {
      if (func.prototype instanceof GraphQLAbstract) {
        continue;
      }

      fields.push(field);
    }

    logger.verbose("Primitive field set:");
    logger.verbose(fields);

    return fields;
  }

  /**
   * Return an array containing the query, data map, and container information to parse data from the GitHub GraphQL
   * API.
   *
   * @returns {Array} contining three elements, the query string, the query data map object, and a container array
   *
   * @protected
   */
  _getGraphQLQuery() {
    this._debugCall("_getGraphQLQuery", arguments);

    throw new NotImplementedError(
      `Missing implementation of the \`${this.constructor.name}._getGraphQLQuery\` method.`,
    );
  }

  /**
   * Clears the cache.
   *
   * @public
   */
  clearCache() {
    this._debugCall("clearCache", arguments);

    this._cache = {};
  }

  // GETTERS / SETTERS -------------------------------------------------------------------------------------------------

  /**
   * Return a property of this item, if available.
   *
   * Properties explicitly set on the object, generally used for identification and lookup in the API, take precedence
   * over any API-gathered or cached fields.
   *
   * This getter is asynchronous, returning a `Promise` when requiring a GitHub API lookup. Caching of all calls occurs
   * automatically and lasts indefinitely, unless the user calls {@link GraphQLAbstract#clearCache}.
   *
   * @example
   * As this getter may return a `Promise` if requiring an API lookup, users should always use the `await` operator when
   * making a call:
   *
   * ```js
   * let labels = await issue.labels;
   * ```
   *
   * @see GraphQLAbstract.clearCache
   *
   * @param {GraphQLAbstract} target - the target to look up on
   * @param {String|Symbol} prop - the name of the property to look up
   *
   * @returns {Promise|undefined|*} the value of `prop`, possibly returned via a `Promise`, or undefined if not found
   *
   * @throws {ReferenceError} if the configured response doesn't have the expected fields
   *
   * @public @async
   */
  get(target, prop) {
    const sProp = String(prop); // Convert `prop` to a String for the case of Symbols.
    const direct = Reflect.get(...arguments);
    const cls = this.constructor.name;
    const fields = target.constructor._fields;

    // Only debug direct calls if in verbose-mode
    target._debugCall("GET", { prop: sProp }, direct ? true : false);

    // Any variables explicitly set in this object take precedence over the cache.
    if (typeof direct !== "undefined") {
      return direct;
    }

    // If the property isn't in the field map, there is nothing more to do
    if (!(sProp in fields)) {
      target._logger.verbose(`Field \`${cls}.${sProp}\` requested, but doesn't exist.`);
      return direct;
    }

    // If a cache exists of the property, return the cache.
    if (sProp in target._cache) {
      target._logger.verbose(`Lookup \`${cls}.${sProp}\` cache hit.`);
      return target._cache[sProp];
    }

    target._logger.verbose(`Lookup \`${cls}.${sProp}\` cache miss.`);

    // If the requested property is a GraphQLAbstract class, use the proper `create` method
    if (fields[sProp].prototype instanceof GraphQLAbstract) {
      target._logger.debug(`Sending creation request to mapped \`${fields[sProp].name}\` class to generate`);

      return (async function LoadFromSmartObject() {
        return await fields[sProp]
          .create(target)
          .then((created) => {
            target._logger.verbose("Created from response:");
            target._logger.verbose(created);

            target._cache[sProp] = created;
            return target._cache[sProp];
          });
      })();

      // Otherwise, load the primitives for the object and return the value
    } else {
      target._logger.debug("Loading data from GitHub GraphQL API...");

      const [query, map, container] = target._getGraphQLQuery();

      target._logger.verbose("Query:");
      target._logger.verbose(query);

      target._logger.verbose("Map:");
      target._logger.verbose(map);

      target._logger.verbose("Container:");
      target._logger.verbose(container);

      return (async function LoadPrimitiveFromGraphQL() {
        return await ActionContext.github.graphql(query, map).then((response) => {
          target._logger.debug("GraphQL API call complete.");

          target._logger.verbose("Full GraphQL API response:");
          target._logger.verbose(response);

          // Travel down the returned response to the data container
          container.forEach((key) => {
            if (!(key in response)) {
              throw new ReferenceError(`Expected container key \`${key}\` in GraphQL response not found.`);
            }

            response = response[key];
          });

          // Run the field function or appropriate generator on each result
          for (const [key, value] of Object.entries(response)) {
            const sKey = String(key);
            const func = target.constructor._fields[sKey];

            // If the field is a GraphQLAbstract instance, run the create function
            if (func.prototype instanceof GraphQLAbstract) {
              target._logger.verbose(`Calling \`create\` method on \`${func.name}\` for \`${sKey}\`...`);
              target._cache[sKey] = func._build(value);

              // Otherwise, run the configured function directly on the value
            } else {
              target._logger.verbose(`Calling \`${func.name}\` on \`${sKey}\`...`);
              target._cache[sKey] = func(value);
            }
          }

          // Now loaded, return the cached property, if set
          return target._cache[sProp];
        });
      })();
    }
  }

  /**
   * Return whether this object has the given property, either directly or as part of the configured GitHub API object.
   *
   * @param {GraphQLAbstract} target - the target to look up on
   * @param {String|Symbol} prop - the name of the property to look up
   *
   * @returns {Boolean} whether the given property exists directly in the target or in that target's GitHub API spec
   *
   * @public
   */
  has(target, prop) {
    // If directly part of the target's schema, it exists
    if (Reflect.get(...arguments) !== "undefined") {
      return true;
    }

    // If the property exists in the mapped fields, it exists
    if (prop in target.constructor._fields) {
      return true;
    }

    // Otherwise, the property doesn't exist
    return false;
  }

  /**
   * Set the given property on this object.
   *
   * If this object explicitly defines the property, this setter logic assumes that target property defines how the
   * performance of the API lookup functions. As such, the setter clears any cache that set, if this occurs.
   *
   * This also handles updating a loaded object's reference via the GitHub GraphQL API, if changed.
   *
   * @param {GraphQLAbstract} obj - the object to update
   * @param {String|Symbol} prop - the property to update
   * @param {*} value - the value to set for that property
   *
   * @returns {boolean} whether the set was successful
   *
   * @throws {TypeError} if attempting to set an unmapped variable on the GraphQL object
   *
   * @public
   */
  set(target, prop, value) {
    const sProp = String(prop); // Convert `prop` to a String for the case of Symbols.
    const isPrimitive = typeof value === "object" || typeof value === "function";

    target._debugCall("SET", {
      prop: sProp,
      value: isPrimitive || target._logger.debugLevel >= Logger.LEVEL.VERBOSE ? value : "...",
    });

    // If the property exists explicitly, clear the cache before setting it.
    if (Reflect.has(target, prop)) {
      target._logger.debug(`Class property \`${sProp}\` set; clearing cache.`);
      target._cache = {};

      return Reflect.set(...arguments);
    }

    // Otherwise, update the field.
    if (sProp in target.constructor._fields) {
      const func = target.constructor._fields[sProp];

      if (func.prototype instanceof GraphQLAbstract) {
        // TODO - Update one-to-many data
        // TODO - Update many-to-many data
        throw new NotImplementedError();
      }

      // TODO - Update the GraphQL API if the value changed

      // Typecast the object and set it on the Label
      target._cache[sProp] = func(value);
    }

    // Setting unmapped fields on GraphQLAbstract objects isn't supported.
    throw new TypeError(`Property \`${sProp}\` cannot be set on a GraphQL object.`);
  }
};
