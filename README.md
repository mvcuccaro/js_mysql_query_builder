# js_mysql_query_builder
A javascript node module for building mysql queries.  Very useful when you want to dynamically build queries and/or need more control over the generated syntax then other magic query builder or ORM modules might allow.

## Example of searching for records with a SELECT statement
```
var query_builder 	= require('./mod.query_builder.js');
var qb				= new query_builder();

var my_modifiers = ['SQL_CALC_FOUND_ROWS', 'DISTINCT'];


/**
* tables to include in the FROM part - really only supports 1 table 
* but i thought maybe id do joins at somepoint but since I use mysql views
* I have had no use for joins in the query builder
*/
var my_tables = [ {name:'some_table'} ];

//Columns we want to query - * is allowed for all columns
var my_fields = [
	{table:'some_table',			column:'test_id'},
	{table:'some_table',			column:'state'}
];

/**
* An array of arrays to build a WHERE clause
* The inner arrays contain objects that will be grouped together with OR operators.
* The Outter arrays contain objects that will be grouped together with AND
* If the operator is not assigned it will use the default which is 'eq' or =
*/
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
		
console.log(my_query);
```
Will produce the following query: 
* *SELECT  SQL_CALC_FOUND_ROWS DISTINCT some_table.test_id, some_table.state FROM some_table   WHERE TRUE  AND (some_table.test_id = "123"  OR some_table.state LIKE "%florida%" ) AND (some_table.name1 = "value1"  OR some_table.name2 = "value2" ) ORDER BY some_column DESC LIMIT 5, 10*

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
