// The Vue object
const Vue = require('vue');

/**
 * Utility function used to perform data object merges. Optimized for vue (if provided)
 * Else it will perform a merge by copying over the values. Which would trigger
 * the appropriate reactivity data binding listeners (if configured)
 *
 * @param {Object} obj  data object to merge into
 * @param {Object} src  data object to copy from
 * @param {Vue Object} vueObj  [optional] vue object to call the set command (for reactivity)
 */
function vueDataMerge(obj, src, vueObj) {
	Object.keys(src).forEach(function(key) {

		// Vue object is provided
		if( vueObj != null ) {
			if( vueObj.$set != null ) {
				// Using the internal object.set command
				// This is present for every component
				vueObj.$set(obj, key, src[key]);
			} else if( vueObj.set != null ) {
				// Using the global Vue.set command
				// This is present for global Vue
				vueObj.set(obj, key, src[key]);
			}
		}

		// Fallsback to legacy behaviour
		// Where it assigns to object directly
		obj[key] = src[key];
	});
	return obj;
}

/**
 * A varient of vueDataMerge, where src value overwrites, and remove values not found in src.
 *
 * @param {Object} obj  data object to merge into
 * @param {Object} src  data object to copy from
 * @param {Vue Object} vueObj  [optional] vue object to call the set command (for reactivity)
 */
function vueDataOverwrite(obj, src, vueObj) {
	// First do the data merge
	vueDataMerge(obj, src, vueObj);

	// Iterate obj, and ensure values are in sync : else nullify if needed
	Object.keys(obj).forEach(function(key) {

		// Object is synced, ignore
		if( obj[key] == src[key] ) {
			return;
		}

		// Vue object is provided?
		if( vueObj != null ) {
			if( vueObj.$set != null ) {
				// Using the internal object.set command
				// This is present for every component
				vueObj.$set(obj, key, null);
			} else if( vueObj.set != null ) {
				// Using the global Vue.set command
				// This is present for global Vue
				vueObj.set(obj, key, null);
			}
		}

		// Fallsback to legacy behaviour : where null is set directly
		obj[key] = null;
	});
	return obj;
}


/**
 * DataObjectModel, is a utility class used to bridge the data connectivity between DataTable API and Vue virtual dom data() system.
 */
class DataObjectModel {

	/**
	 * Constructor with configuration object
	 *
	 * @param  {Object} inConfig  Configuration object, proxies to .config(obect)
	 */
	constructor( inConfig ) {
		// Ensures the internal config
		// is initialized, for setup
		this._config = this._config || {};
		// Setup the config
		this.config( inConfig );
	}

	/**
	 * Overwrites the respective config setting,
	 * If provided with the resepctive key value pairs
	 *
	 * + _oid
	 * + api
	 * + apiGet
	 * + apiSet
	 * + model
	 * + vue
	 *
	 * Note: if both api, and apiGet/Set is provided, the apiGet/Set takes priority
	 *
	 * @param  {Object} inConfig  Configuration object
	 *
	 * @return {DataObjectModel} return itself, aka 'this' object
	 */
	config( inConfig ) {
		// The input config object
		inConfig = inConfig || {};

		// Set the _oid
		if( inConfig._oid ) {
			this._oid( inConfig._oid );
		}

		// The generic api config
		if( inConfig.api ) {
			this.api( inConfig.api );
		}

		// The api.get function
		if( inConfig.apiGet ) {
			this.apiGet( inConfig.apiGet );
		}

		// The api.set function
		if( inConfig.apiSet ) {
			this.apiSet( inConfig.apiSet );
		}

		// The data model object
		if( inConfig.model ) {
			this.model( inConfig.model );
		}

		// The vue object
		if( inConfig.vue ) {
			this.vue( inConfig.vue );
		}

		// return itself
		return this;
	}

	/**
	 * Get / Set the object id
	 *
	 * @param {String} inOid [Optional] oid to set, if null this works as a 'get' function
	 *
	 * @return {String} configured _oid in the system
	 */
	_oid( inOid ) {
		// Set the _oid, if provided
		if( inOid ) {
			this._config._oid = inOid;
		}
		// The configured _oid
		return this._config._oid;
	}

	/**
	 * Get / Set the getting function, used in the "load" command
	 *
	 * This function is expected to be called with an object containing { _oid : "actual oid value" }
	 * This function is expected to return a promise object
	 *
	 * This promise is expected to fullfill (aka good), with an object,
	 * 	- with the resulting data in "result" key, on success OR
	 * 	- with the resulting ERROR in "ERROR" key, on application error
	 * This promise is expected to reject (aka bad), with an exception otherwise
	 *
	 * @param {Function} getFunction [Optional] API function
	 *
	 * @return {Function} Configured getFunction
	 */
	apiGet( getFunction ) {
		// Set the getFunction, if provided
		if( getFunction ) {
			this._config.apiGet = getFunction;
		}
		// The configured get function
		return this._config.apiGet;
	}

	/**
	 * Get / Set the setter function, used in the "save" command
	 *
	 * This function is expected to be called with an object containing { _oid : "actual oid value", data : { update data } }
	 * This function is expected to return a promise object
	 *
	 * This promise is expected to fullfill (aka good), with an object,
	 * 	- with the resulting data in "result" key, on success OR
	 * 	- with the resulting ERROR in "ERROR" key, on application error
	 * This promise is expected to reject (aka bad), with an exception otherwise
	 *
	 * @param {Function} setFunction [Optional] API function
	 *
	 * @return {Function} Configured setFunction
	 */
	apiSet( setFunction ) {
		// Set the setFunction, if provided
		if( setFunction ) {
			this._config.apiSet = setFunction;
		}
		// The configured get function
		return this._config.apiSet;
	}

	/**
	 * The api object, to use the .get, and .set function.
	 * This is a convinence function to both apiGet, and apiSet.
	 *
	 * Note : If this is called, after apiGet/Set with the relevent object value
	 *        It will overwrite the previously configured apiGet/Set
	 *
	 * @param {Object} apiObj [Optional] API object, with .get, and .set property for get/set
	 *
	 * @return {Object} An object with .get, and .set, for apiGet/apiSet respecttively.
	 */
	api( apiObj ) {
		// Setup the api get/set respectively
		if( apiObj ) {
			if( apiObj.get ) {
				this.apiGet( apiObj.get );
			}
			if( apiObj.set ) {
				this.apiSet( apiObj.set );
			}
		}

		// Return a new object, with both existing function
		return {
			get : this._config.apiGet,
			set : this._config.apiSet
		};
	}

	/**
	 * The data object model, to bind loaded data into.
	 * Also used to save data back to the system
	 *
	 * Note: If an object was previously loaded with a .load
	 *       this function will replace the object in place.
	 *
	 * @param {Object} modelObj [Optional] model object to push save/load updates into
	 *
	 * @return {Object} the current model object
	 */
	model( modelObj ) {
		// Setup the model object (if given)
		if( modelObj ) {
			this._config.model = modelObj;
		}
		// Return configured value
		return this._config.model;
	}

	/**
	 * The vue object, used to do the reactivite value update.
	 * This is optional, if reactivity "gotchas" are properly handled.
	 * Else this makes things easier.
	 *
	 * See: https://vuejs.org/v2/guide/reactivity.html
	 *
	 * @param {Vue Object} vueObj [Optional] use either the component instance of vue, or the global Vue object
	 *
	 * @return {Vue Object} the configured vue object
	 */
	vue( vueObj ) {
		// Setup the vue object (if given)
		if( vueObj ) {
			this._config.vue = vueObj;
		}
		// Return the configured value
		return this._config.vue;
	}

	/**
	 * Load the data object via the API, and syncronise its value into the model object
	 *
	 * @param {String} inOid  [Optional] object ID to use, if given this overwrites the current configured _oid
	 *
	 * @return Promise object, when fullfilled returns the "model" object, when rejected returns the error msg or exception.
	 */
	load( inOid ) {
		let self = this;

		// Overwrite the oid if needed
		if( inOid ) {
			self._oid( inOid );
		}

		// Does the load, and return the respective promise
		return new Promise(function(good,bad) {
			// Load the data
			var _oid = self._config._oid;

			// Call the apiGet
			self._config.apiGet( { _oid : _oid } ).then(function(res) {
				// Terminate with bad result, if relevent
				if(res) {

					// Error handling
					if(res.ERROR || res.error) {
						bad( res.ERROR || res.error );
						return;
					}

					// Terminate with good result, if found
					if( res.result ) {
						// Ensure there is a "model" object to merge result into
						if( !self._config.model ) {
							self._config.model = {};
						}

						// Merge the result in
						vueDataOverwrite(self._config.model, res.result, self._config.vue);

						// Return the model result
						good( self._config.model );
						return;
					}
				}
				// Terminate with lack of result
				bad( "Missing response, or response.result value : "+res );
			}, function(err) {
				// Forward the error
				bad( err );
			});
		});
	}

	/**
	 * Save the data object via the API
	 *
	 * @param {String} inOid  [Optional] object ID to use, if given this overwrites the current configured _oid
	 *
	 * @return Promise object, when fullfilled returns the result status, when rejected returns the error msg or exception.
	 */
	save( inOid ) {
		let self = this;

		// Overwrite the oid if needed
		if( inOid ) {
			self._oid( inOid );
		}

		// Does the load, and return the respective promise
		return new Promise(function(good,bad) {
			// Load the data
			var _oid = self._config._oid;

			// Call the apiSet
			self._config.apiSet( {
				_oid : _oid,
				data : self._config.model || {}
			} ).then(function(res) {
				// Terminate with bad result, if relevent
				if(res) {
					// Error handling
					if(res.ERROR || res.error) {
						bad( res.ERROR || res.error );
						return;
					}

					// Terminate with good result, if found
					// Since false is a valid response, so simply not null
					if( res.result !== null ) {
						// Return the model result
						good( res.result );
						return;
					}
				}
				// Terminate with lack of result
				bad( "Missing response, or response.result value : "+res );
			}, function(err) {
				// Forward the error
				bad( err );
			});
		});
	}
}

// Actual module export
export default DataObjectModel;
