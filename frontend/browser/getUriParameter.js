/**
 * Utility function, for extracting the URI parameter in javascript
 * from the current browser window.
 * 
 * WARNING : Do not modify the return param object, as this is cached
 *           between multiple getUriparameter calls. Creating unexpected behaviour.
 *           For more modern browsers, Object.freeze is used to prevent changes.
 * 
 * @param {String}  name  [Optional] parameter name to find, 
 *                                   if null, the full parmeter object is returned.
 * 
 * @return  {String|Object} String value of the parameter name (if name is given), 
 *                          or parameter object (if name is null), which should be
 *                          considered read only
 */
function getUriParameter(name) {
	// The full URI param
	var param = getUriParameterFull();

	// A null name would do a full object search
	if( name === undefined || name === null ) {
		return param;
	}

	// Does the parameter search varient
	return param[name];
}

/**
 * The following two vars, caches the result for getUriParameterFull 
 * for perhaps micro optimization reasons.
 */
var _cachedSearchString = null;
var _cachedSearchObject = {};

/**
 * Full object varient of get UriParameter, with name param being null
 * 
 * @return  {Object} the param object. As this object is cached, DO NOT modify it
 */
function getUriParameterFull() {
	// Full query search string,
	// starting with "?"
	var searchString = location.search;

	// Check for cached copy
	if( _cachedSearchString == searchString ) {
		// valid cache copy, returns it
		return _cachedSearchObject;
	}

	// The result object
	var result = {};
	
	// Processing the search string into a result
	searchString // The the query string, 
	.substr(1) // Remove out the "?" prefix
	.split("&") // Split the result on '&' instance
	.forEach(function (pairStr) { // Iterate each key value pair as an "pairStr"
		var pair = pairStr.split("="); // Split key value pair, properly
		result[ pair[0] ] =  decodeURIComponent(pair[1]); // Register the result properly
	});

	// Seal the result (if command is present)
	// effectively making it read-only
	if( Object.freeze ) {
		result = Object.freeze(result);
	}

	// Cache the result
	_cachedSearchString = searchString;
	_cachedSearchObject = result;

	// Return the result
	return result;
}

// Export the getUriParameter
export default getUriParameter;