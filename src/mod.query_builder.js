module.exports = function() {
	this.where 			= '';
	this.select			= '';
	this.update 		= '';
	this.default_table	= null;

    return {
        buildClause:buildClause,
        buildLimit:buildLimit,
        buildSelect:buildSelect,
        buildUpdate:buildUpdate,
        buildOrderBy:buildOrderBy,
        getQuery:getQuery,
        getWhere:getWhere,
        _removeLastComma:_removeLastComma
	}

	function buildSelect(arg_base, arg_sel_modifiers, arg_tables, arg_fields)	{

		this.select 			= arg_base + ' ';
		total_tables			= arg_tables.length;
		
		var select 				= this.select;

		arg_sel_modifiers.forEach( function(modifier) {
			select += modifier + ' ';
		});


		var i 					= 0;

		//check to see if the first object in the fields array has a property called columns if yes then this is a table provided once object
		var table_provided_once = arg_fields[0].columns === undefined ? false : true;

		//choose which table/fields you want to return in the result set.

		//this version of the field builder assumes we get an array of objects for arg_fields and that each object in the array contains a table name and a column
		if( !table_provided_once ){
			arg_fields.forEach( function(element){
				field_string = element.table + '.' + element.column;
				if( element.distinct !== undefined && element.distinct == true ) {
					field_string = ' DISTINCT(' + field_string + ')';
				} 
				select += field_string + ', ';
			});

			select = this._removeLastComma(select);
			select += ' FROM ';
		}

		//this version of the field builder assumes we got an array of objects and that each object contains a table name and then an array of columns for that table
		if( table_provided_once ){
			console.log('table_provided_once');
			arg_fields.forEach( function(outter_element){
				var table = outter_element.table;
				outter_element.columns.forEach(function(inner_element){
					if( inner_element.startsWith('---') ) {
						var column = inner_element.replace('---', '');
						select += ' DISTINCT(' + table + '.' + column  + '), ';
					} else {
						select += table + '.' + inner_element + ', ';
					}
				})

			});
			select = this._removeLastComma(select);
			select += ' FROM ';
		}

		//add the tables that we are selecting from
		var i = 0;
		arg_tables.forEach( function(element){
			i++;
			select 	+= element.name;
			if( i < total_tables ) {
				select += ', ';
			}
			else{
				select += ' ';
			}
		});

		this.select = select;
		return this;
	}

	function buildUpdate(arg_base, arg_table, arg_update_columns){
		var update;
		this.default_table 	= arg_table;
		update = arg_base + ' ' + arg_table + ' SET ';
		Object.keys(arg_update_columns).forEach(function(key,index) {
			key_string = '`' + key + '`';
			value_string = arg_update_columns[key] == null ? arg_update_columns[key] : '"' + arg_update_columns[key] + '"';
			update += key_string + ' = ' + value_string + ', ';
		});
		update = this._removeLastComma(update);
		this.update = update;
		return this;
	}

	/**
	* buildClause()
	* 
	* arg_base: 		string to start the where with ie " WHERE TRUE "
	* arg_clause: 		array with an array of objects. 
	*					objects in inner arrays will be connected by OR
	*					arrays in outter array will be appended with AND
	* returns:    		this
	*/
	function buildClause(arg_base, arg_clause){
		var where = arg_base;

		if( arg_clause === null || typeof(arg_clause) != 'object' || Object.keys(arg_clause).length == 0 ){
			this.where = ' ' + where + ' '
			return this;
		}

		//if we didnt get the array we expect - cast a very basic object into an array we can use
		//we can only do this if we have a default table
		if( arg_clause.length == undefined && this.default_table != null ){
			var new_clause = [];
			var default_table = this.default_table;
			Object.keys(arg_clause).forEach(function(key, index){
				var new_clause_object 		= {table:default_table};
				new_clause_object.column 	= key;
				new_clause_object.value 	= arg_clause[key];	 

				new_clause.push([new_clause_object]);
				arg_clause = new_clause;
			});
		}

		arg_clause.forEach(function(outter_element) {
			where += ' AND (';
			var i = 0;
			total_clause = outter_element.length;
			outter_element.forEach(function(inner_element) {
				i++;
				if( inner_element.operator === undefined || inner_element.operator == 'eq'){
					where += inner_element.table + '.' + inner_element.column + ' = "' + inner_element.value + '" ';
				}
				else { 
					switch( inner_element.operator.toLowerCase() ){
						case 'gt':
						case 'greater_than':
							where += inner_element.table + '.' + inner_element.column + ' > "' + inner_element.value + '" ';
							break;

						case 'gte':
						case 'greater_than_equal_to':
							where += inner_element.table + '.' + inner_element.column + ' >= "' + inner_element.value + '" ';
							break;

						case 'lt':
						case 'less_than':
							where += inner_element.table + '.' + inner_element.column + ' < "' + inner_element.value + '" ';
							break;

						case 'lte':
						case 'less_than_equal_to':
							where += inner_element.table + '.' + inner_element.column + ' <= "' + inner_element.value + '" ';
							break;

						case 'sw':
						case 'starts_with':
							where += inner_element.table + '.' + inner_element.column + ' LIKE "%' + inner_element.value + '" ';
							break;

						case 'ew':
						case 'ends_with':
							where += inner_element.table + '.' + inner_element.column + ' LIKE "' + inner_element.value + '%" ';
							break;

						case 'pm':
						case 'partial_match':
						case 'contains':
							where += inner_element.table + '.' + inner_element.column + ' LIKE "%' + inner_element.value + '%" ';
							break;
						case 'nn':
						case 'not_null':
							where += inner_element.table + '.' + inner_element.column + ' is not null';
							break;

						case 'in':
							var value_is_array 	= typeof inner_element.value === 'object' ? true : false;
							var group 			= ''; 
							if( value_is_array ){
								group 	= '("' + inner_element.value.join('","') + '")';
							}
							else{
								group 	= '(' + inner_elemenent.value + ')';
							}
							where += inner_element.table + '.' + inner_element.column + ' IN ' + group;
							break;

						case 'not_in':
							var value_is_array 	= typeof inner_element.value == 'object' ? true : false;
							var group 			= ''; 
							if( value_is_array ){
								group 	= '("' + inner_element.value.join('","') + '")';
							}
							else{
								group 	= '(' + inner_elemenent.value + ')';
							}
							where += inner_element.table + '.' + inner_element.column + ' NOT IN ' + group;
							break;

						default:
							where += inner_element.table + '.' + inner_element.column + ' = "' + inner_element.value + '" ';
							break;
					}

				}
				if( i < total_clause) {
					where += ' OR ';
				}
				else{
					where += '';
				}

			});
			where += ')';
		});

		this.where = where;
		return this;
	}

	/**
	* buildOrderBy()
	*
	* arg_order_by: 	object with a column and a direction
	* returns: 			this
	*/
	function buildOrderBy(arg_order_by = null){
		if( arg_order_by == null ) {
			return this;
		}
		var column 		= arg_order_by.column;
		var direction	= arg_order_by.direction;
		this.where += ' ORDER BY ' + column + ' ' + direction + ' ';
		return this;
	}

	/**
	* buildLimit()
	*
	* arg_limit						: how many records to retrieve
	* arg_offset					: how many records to offset
	* arg_offset_is_page_number		: whether or not the offset is used for number of records to offset or number of pages to offset
	* 
	* returns						: this
	*/
	function buildLimit(arg_limit, arg_offset, arg_offset_is_page_number = false)
	{
		if( arg_limit === undefined || arg_limit === null ) {
			return this;
		}

		var offset 	= arg_offset;

		if( arg_offset_is_page_number ) {
			var page_number	 = arg_offset <= 1 ? 1 : arg_offset;
			real_page_number = page_number - 1;
			offset 		= real_page_number * arg_limit;
		}
		else {
			offset	 	= arg_offset;
		}

		this.where += ' LIMIT ' + offset + ', ' + arg_limit;
		return this;
	}

	function getQuery(arg_type = 'select')
	{
		switch(arg_type.toLowerCase()){
			case 'update':
				return this.update + ' ' + this.where;
				break;
			default:
				return this.select + ' ' + this.where;
				break;
		}
		
	}

	function getWhere(){
		return ' ' + this.where;
	}

	function _removeLastComma(arg_string){
		return arg_string.replace(/,\s*$/, "");
	}
};

/** 
* sample code showing how to pass data into the query builder...
*
*---------------------------------------------------------------
var query_builder 	= require('./mod.query_builder.js');
var qb				= new query_builder();

var my_modifiers = ['SQL_CALC_FOUND_ROWS', 'DISTINCT'];

var my_fields = [
	{table:'companies',			column:'test_id'},
	{table:'companies',			column:'state'}
	
];
** OR var my_fields = [ 
	{table: 'table1', columns['column1', 'column2']}, {table: 'table2', columns['column3', 'column4']} 
];

var my_clause 		= [
	[
		{table:"some_table", 	column:"test_id", 		value:"123"},
		{table:"some_table", 	column:"state",			operator:"contains", value:"florida"}
	],
	[
		{table:"some_table", 	column:"name1",			value:"value1"},
		{table:"some_table", 	column:"name2",			value:"value2"}
	]
];

** value can be an array if the operator is expecting a group ex state in ("FL", "GA") then value = ["FL", "GA"]
** operator is optional - if it is not defined the operator will be = 


var my_tables = [
	{name:'companies'}
];

var my_order_by = { table:'some_table', column:'some_column', direction:'DESC' };  //for no order by just send null



var my_query = qb.buildSelect('SELECT ', my_modifiers, my_tables, my_fields).
				buildClause(' WHERE TRUE ', my_clause).buildeOrderBy(my_order_by)
				buildLimit(10,5).getQuery();
console.log(my_query);


operators are :
eq : = 

gt, greater_than : >

gte, greater_than_equal_to : >=

lt, less_than : <

lte, less_than_equal_to : <=

sw : like "%adsf"

ew : like "asdf%"

pm, partial_match, contains : like "%adsf%"

nn, not_null : not null

in : in ()

not_in : not in ()

*/