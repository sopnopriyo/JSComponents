<template>
	<div class="dataobject-table-wrapper" v-once>
		<!-- 
		- The above v-once, ensures that vue does NOT handle the handling of html underneath.
		- Which is critical for this component.
		-
		- See: https://vuejs.org/v2/api/#v-once
		- See: https://vuejsdevelopers.com/2017/05/20/vue-js-safely-jquery-plugin/
		-->
	</div>
</template>
<style lang='less'>
/*
** Ensure style scoping into dataobjecttable
*/
.dataobjecttable {
	.searchbox input[type="search"] {
		border: 1px solid #dadada;
		border-radius: 3px;
	}
}
</style>

<script type='text/babel'>
//--------------------------------------
// Dependencies
//--------------------------------------

//--------------------------------------
// Component
//--------------------------------------
export default {
	//--------------------------------------
	// Properties
	//--------------------------------------
	props:{

		//--------------------------------------------------------------------
		// Table formatting
		//--------------------------------------------------------------------

		// Header display setting, 
		// expect either an array or a json string
		headerNames: {
			default: '["Name"]'
		},

		// Header field name setting,
		// expect either an array or a json string
		fieldNames: {
			default: '["name"]'
		},

		// Default OID collumn label, if blank it will be hidden
		oidLabel : {
			default: ""
		},

		// Additional table classes, this is useful for CSS styling
		tableClass : {
			default: "dataobject-table"
		},

		// Router name to redirect page to on click. This is disabled if blank.
		// Note that 'query : { _oid : "rowObjectID" }' will be added to objectPageName
		objectPageName : {
			default: ""
		},

		// Pre filter query, used to reduce the results
		query : {
			default: ""
		},

		// Pre filter query args
		// expect either an array or a json string
		queryArgs : {
			default: '[]'
		},
		
		//--------------------------------------------------------------------
		// API linkage handling
		//--------------------------------------------------------------------

		// API Namespace to load from
		// This assumes a JavaCommons api.js object is loaded in global
		//
		// Note that this will automatically be converted to the api URL
		// As this module actually bypasses the API object functions, and 
		// its own http requests directly
		apiNamespace: {
			default: "account.info.list.datatables",
			type: String,
		},

		//--------------------------------------------------------------------
		// Automated jquery datatables dependencies fetching
		// Not used if datatable js library is already found to be loaded
		//--------------------------------------------------------------------
		datatableJsUrl: {
			default: "//cdn.datatables.net/1.10.16/js/jquery.dataTables.js",
			type: String,
		},
		datatableCssUrl: {
			default: "//cdn.datatables.net/1.10.16/css/jquery.dataTables.css",
			type: String,
		}
	},
	
	//--------------------------------------
	// Computed Properties
	//--------------------------------------
	computed: {

		//--------------------------------------------------------------------
		// Table formatting
		//--------------------------------------------------------------------

		// HeaderNames as an array
		headerNamesArray() {
			if( Array.isArray(this.headerNames) ) {
				return this.headerNames;
			} 
			return JSON.parse(this.headerNames);
		},
		
		// HeaderNames as an array
		fieldNamesArray() {
			if( Array.isArray(this.fieldNames) ) {
				return this.fieldNames;
			} 
			return JSON.parse(this.fieldNames);
		},

		// queryArgs as an array
		queryArgsArray() {
			if( Array.isArray(this.queryArgs) ) {
				return this.queryArgs;
			} 
			if( this.queryArgs == '[null]' ) {
				return [null];
			}
			return JSON.parse(this.queryArgs);
		},

		// Full header names as an array : including the starting _oid
		headerNamesArray_full() {
			return [this.oidLabel || "Object ID"].concat( this.headerNamesArray );
		},

		// Full filed names as an array : including the starting _oid
		fieldNamesArray_full() {
			return ["_oid"].concat( this.fieldNamesArray );
		},

		//--------------------------------------------------------------------
		// API linkage handling
		//--------------------------------------------------------------------

		// Gets and returns the full api url, from the apiNamespace
		// This is passed the data-table object
		fullApiUrl() {
			if( api == null ) {
				throw "Missing global api object";
			}
			return api._core.baseURL()+this.apiNamespace.replace(/\./g, "/");
		},

		//--------------------------------------------------------------------
		// DOM manipulation handling
		//--------------------------------------------------------------------

		// Root jq dom object, aka "dataobject-table-wrapper"
		rootJQDom() {
			return $(this.$el);
		},

		// Table template : This is the bare HTML table to use before loading JQuery.dataTables
		htmlTableTemplate() {
			// Array use as a "StringBuilder"
			let html = [];

			// Start : table tag
			html.push( '<table class="'+this.tableClass+'">' );

			// Start : first row table header
			html.push( '<thead class="thead-default"><tr>' );

			// For each collumn name
			var headerNamesArray_full = this.headerNamesArray_full;
			for(var i=0; i<headerNamesArray_full.length; ++i) {
				html.push( '<th class="align-middle">'+headerNamesArray_full[i]+'</th>' );
			}

			// End : first row table header
			html.push( '</tr><thead class="thead-default">' );

			// Start / End : Table body content
			html.push( '<tbody></tbody>' );
			
			// End : table tag
			html.push( '</table>' );

			return html.join("");
		},

		//--------------------------------------------------------------------
		// DataTable.js integration
		//--------------------------------------------------------------------

		// Collumns visibility rulling array
		columnsRules() {
			let col = [];
			let headerNamesArray_full = this.headerNamesArray_full;
			
			// Prepare a blank "col" list
			for(let i=0; i<headerNamesArray_full.length; ++i) {
				col[i] = null;
			}

			// Special rule for _oid collumn label
			if( this.oidLabel && this.oidLabel.length > 0 ) {
				// does nothing, use it as per normal
			} else {
				// hides it
				col[0] = {visible:false};
			}

			// Return the columns rules
			return col;
		},

		// Defines custom behaviour for each column
		aoColumnDefs(){
			return [];
		},

		/**
		 * The full final datatable config : Used by reloadDisplay
		 */
		datatableJSConfig() {
			// Basic self refrence
			var self = this;

			// Config object to return
			var config = {
				processing: true,
				serverSide: true,
				columns: self.columnsRules,
				aoColumnDefs: self.aoColumnDefs,
				ajax:{
					url: self.fullApiUrl,
					type: "POST",
					data: {
						fieldList: JSON.stringify(self.fieldNamesArray_full)
					},
					xhrFields: {
						withCredentials: true
					}
				},
				// Default to first collumn ordering
				order: [[ 1, 'asc' ]],
				// Text language overwrites
				language: {
					//" - filtered from _MAX_ records"
					infoFiltered : ""
				}
			};

			// Handlign of query
			if( self.query && self.query.length > 0 ) {
				config.ajax.data.query = self.query;
				config.ajax.data.queryArgs = JSON.stringify(self.queryArgs);
			}

			// Handling of on-click
			if( self.objectPageName && self.objectPageName.length > 0 ) {
				config.createdRow = function(row, data, index) {
					$(row).click(function() {

						if( self.objectPageName && self.objectPageName.length > 0 ) {
							self.$router.push({
								name : self.objectPageName,
								query : {
									_oid : data[0]
								}
							});
						}

					}).css({cursor: "pointer"});
				}
			}

			return config;
		},

	},
	//--------------------------------------
	// Methods
	//--------------------------------------
	methods:    {

		/**
		 * Load (if needed), the client library for datatables
		 *
		 * @param  callBack Callback for the load
		 */
		loadClientDependencies(callBack) {
			// The vue object
			let self = this;

			// Check for DataTable
			if( $(".datatable-wrapper .table").DataTable ) {
				// Datatable is valid
				callBack();
			} else {
				$(function() {
					// Actually load the CSS
					// Sadly jquery does not have .getCss
					// https://techblog.willshouse.com/2012/11/21/jquery-getcss/
					jQuery('head').append('<link rel="stylesheet" rel="nofollow" href="'+self.datatableCssUrl+'" type="text/css" />');

					// Load the datatable javascript, and add the callback
					jQuery.ajax({
							url: self.datatableJsUrl,
							dataType: 'script',
							success: callBack,
							async: true
					});
				});
			}
		},

		/**
		 * Reload the current display from scratch.
		 */
		reloadDisplay() {
			// Get root dom
			let self = this;

			// Ensure reload ONLY occurs after body load
			$(document).ready(function() {
				
				// Get and reset root
				let root = self.rootJQDom;
				root.html("");

				// Prepopulate with table template
				root.html( self.htmlTableTemplate );

				// Load up datatable
				let table = root.find("table");
				self.dataTableObject = table.DataTable(self.datatableJSConfig);
			});
		}
	},

	//--------------------------------------
	// On created
	//--------------------------------------
	mounted: function() {
		// Self refrence
		let self = this;

		// Loading of client side libraries
		this.loadClientDependencies(function() {
			// Reload the frontend display
			self.reloadDisplay();
		});
	}
}
</script>
