# js_mysql_query_builder
A javascript object for building mysql queries.  Very useful when you want to dynamically build queries and/or need more control over the generated syntax then other magic query builder modules might allow.

## Example of searching for records with a SELECT statement
```
var query_builder 	= require('./mod.query_builder.js');
var qb				= new query_builder();

var my_modifiers = ['SQL_CALC_FOUND_ROWS', 'DISTINCT'];

//Columns we want to query - * is allowed
var my_fields = [
	{table:'some_table',			column:'test_id'},
	{table:'some_table',			column:'state'}
];

//An array of arrays to build a WHERE clause
//The inner arrays contain objects that will be grouped together with OR operators.
//The Outter arrays contain objects that will be grouped together with AND
//If the operator is not assigned it will use the default which is 'eq' or =
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

//object to build the order by clause (can also be an array of objects if you want to sort by multiple columns
var my_order_by = { table:'some_table', column:'some_column', direction:'DESC' };  


var my_query  = qb.buildSelect('SELECT ', my_modifiers, my_tables, my_fields)
                .buildClause(' WHERE TRUE ', my_clause)
                .buildeOrderBy(my_order_by)
                .buildLimit(10,5).getQuery();
```
## Operators for where clause objects
- operators are :
- eq : = 
- gt, greater_than : >
- gte, greater_than_equal_to : >=
- lt, less_than : <
- lte, less_than_equal_to : <=
- sw : like "%adsf"
- ew : like "asdf%"
- pm, partial_match, contains : like "%adsf%"
- nn, not_null : not null
- in : in ()
- not_in : not in ()
