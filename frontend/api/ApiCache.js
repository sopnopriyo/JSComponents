/**
 * Calls an api endpoint, and cache's the result Promise object for reuse.
 * This is used to optimize certain API calls which would have returned the same result anyway.
 * 
 * This also merges in request with the same parameters, if existing calls are pending.
 * 
 * Note that only succesful results (not null - nor false) are cached.
 * (Such as config)
 * 
 * If this module works out succesfully, it will probably be merged into api.js
 * 
 * @param  {String}   endpointPath in dot notation to make the API request
 * @param  {...args}  args various arguments to forward
 * 
 * @return {Promise} resulting promise object from the API
 */
function ApiCache(endpointPath, args) {
	// Calls the raw api cache function
	return apiCacheRaw(endpointPath, Array.apply(null, arguments).slice(1));
}

/**
 * The actual implementation, however it expects the full argument array,
 * instead of accepting a variable argument set
 * 
 * @param  {String}   endpointPath in dot notation to make the API request
 * @param  {[Array]}  argsArray various arguments to forward
 * 
 * @return {Promise} resulting promise object from the API
 */
function apiCacheRaw(endpointPath, argsArray) {
	// Stringify the args, used for the caching key
	let argStr = JSON.stringify( argsArray || [] );

	// Attempt to get from the cache
	//--------------------------------------

	// Check request cache, use it if so
	if( requestCache[endpointPath] && requestCache[endpointPath][argStr] ) {
		return requestCache[endpointPath][argStr];
	}
	// Check result cache, use it if so
	if( resultCache[endpointPath] && resultCache[endpointPath][argStr] ) {
		return resultCache[endpointPath][argStr];
	}

	// At this point, the cache has failed
	// Time to do the actual request.
	//--------------------------------------

	// Make the promise request, get the actual result
	let res = api._core.callEndpoint.apply(
		api._core.callEndpoint, [endpointPath].concat( argsArray || [] )
	);

	// Ensure the request cache has a "save point"
	if( requestCache[endpointPath] == null ) {
		requestCache[endpointPath] = {};
	}
	// Store it in the request cache
	requestCache[endpointPath][argStr] = res;

	// Processor to cache the result if needed
	//-------------------------------------------
	res.then(function(good) {
		// Clear the request cache
		requestCache[endpointPath][argStr] = null;
		// Check for RESULT
		if( good.result ) {
			// Ensure the result cache has a "save point"
			if( resultCache[endpointPath] == null ) {
				resultCache[endpointPath] = {};
			}
			// Valid result, cache it
			resultCache[endpointPath][argStr] = res;
		}
	}, function(bad) {
		// Clear the request cache regardless
		requestCache[endpointPath][argStr] = null;
	});

	// Return the requested promise (it should be cached by now =P )
	return res;
}

/**
 * Clears the various cache for an endpointPath, this is useful on mounted,
 * As it will ensure certain data (such as table list) is updated properly.
 */
function apiCacheClear(endpointPath) {
	// Check request cache, and clear it
	if( requestCache[endpointPath] ) {
		requestCache[endpointPath] = null;
	}
	// Check result cache, use it if so
	if( resultCache[endpointPath] ) {
		resultCache[endpointPath] = null;
	}

}

/**
 * The request cache, this is done to merge in requests
 * 
 * This is done in the following format:
 * cache[endpointPath][stringified-args] = Promise
 */
let requestCache = {

}

/**
 * The result cache, storing the final Promise object,
 * only if a proper result was returned previously
 * 
 * This is done in the following format
 * cache[endpointPath][stringified-args] = Promise
 */
let resultCache = {

}

// Exposing other functions
ApiCache.raw = apiCacheRaw;
ApiCache.clear = apiCacheClear;

// Export the ApiCache function object
export default ApiCache;