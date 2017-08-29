# js_mysql_query_builder
A javascript object for building mysql queries

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
