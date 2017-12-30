/**
 * Utility function used to perform data object merges. Optimized for vue (if provided)
 * Else it will perform a merge by copying over the values. Which would trigger 
 * the appropriate reactivity data binding listeners (if configured)
 * 
 * @param {Object} obj  data object to merge into 
 * @param {Object} src  data object to copy from
 * @param {Vue Object} vueObj  [optional] vue object to call the set command (for reactivity)
 * @param {Boolean} overwrite  [optional] remove values not found in src
 */
function vueDataMerge(obj, src, vueObj, overwrite) {

	// Data merging from src to object
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

	if( overwrite ) {	
		// Data overwrite removal on obj
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
	}
	return obj;
}

export default vueDataMerge