# amadeus.js

// installation by script tags && Node Module

### .Db

  ```javascript
  var db = new amadeus.Db({
    name: 'mdb'
  });
  ```
  Db takes an object with a single *'name'* property.
  
### .Db.createTable

  Tables can be created with basic arrays and nested objects
  
  **Array**:
  
  ```javascript
  var a = [
    { 
      name: 'JavaScript',
      ext: '.js'
    },
    { 
      name: 'C#',
      ext: '.cs'
    },
    { 
      name: 'Python',
      ext: '.py'
    }
  ];
  
  db.createTable({
    name: 'languages_I',
    type: 'object',
    data: a
  });
  ```
  
  **Object**:
  
  ```javascript
  var o = {
    0: {
      name: 'JavaScript',
      typed: 'weakly'
    },
    1: {
      name: 'C#',
      typed: 'strongly'
    },
    2: {
      name: 'Python',
      typed: 'dynamically'
    }
  }
  
  db.createTable({
    name: 'languages_II',
    type: 'object',
    data: o
  });
  ```
  
  Following initialisation, the tables above can be queried using the amadeus query syntax. Querying will create a carbon copy of the table's *'data'* property called **activeQuery** - which can be amended and used as appropriate. A tabular representation of the objects above can be found below:
  
  **languages_I**:
  
  name | ext
  ----- | -----
  JavaScript | .js
  C# | .cs
  Python | .py
  
 **languages_II**:
  
  name | typed
  ----- | -----
  JavaScript | weakly
  C# | strongly
  Python | dynamically

### Querying

  An **activeQuery** is initialised with the **.select** function. The first argument must be a Db Table or saved Query:
  
  ```javascript
  db.select('languages_I', {
    ret: '*'
  });
  ```
  **AS sql:**
  
  ```sql
  select * from languages_I
  ```
  
  The second argument must have a *'ret'* property which either takes the '\*' wildcard as a string or a list of columns as an array. Once the **activeQuery** has been created, a query can executed by chaining calls to the **.select** function.
  
  ```javascript
  db.select('languages_I', {
    ret: '*'
  }).where('neq', {
    name: 'JavaScript'
  });
  ```
  **AS sql:**
  ```sql
  select * from languages_I where name != 'JavaScript'
  ```
  
  If printed as a table, the above **activeQuery** would display:
  
  name | ext
  ----- | -----
  C# | .cs
  Python | .py
  
  Additional logic can be added by using the **.and** and **.or** chains:
  
  ```javascript
  db.select('languages_I', {
    ret: '*'
  }).where('neq', {
    name: 'JavaScript'
  }).and('isLike', {
    ext: 'p'
  });
  ```
  **AS sql:**
  ```sql
  select * from languages_I where name != 'JavaScript' and ext = '%p%'
  ```
  
  The **activeQuery** would display:
  
  name | ext
  ----- | -----
  Python | .py

  ```javascript
  db.select('languages_I', {
    ret: '*'
  }).where('neq', {
    name: 'JavaScript'
  }).and('isLike', {
    ext: 'p'
  }).or('=', {
    name: 'JavaScript'
  });
  ```
  
  **AS sql:**
  ```sql
  select * from languages_I where (name != 'JavaScript' and ext '%p%') or name = 'JavaScript'
  ```
  
  The **.or** chain queries the against the original **selectQuery** query created from the **.select** function. So therefore, the above **activeQuery** would display as: 
  
  name | ext
  ----- | -----
  Python | .py
  JavaScript | .js

  Additionally, a conditional call can be made which will execute a query chain if an expression evaluates to true. This is useful to chain based on the input from a HTML form. The first argument of the **.conditional** function takes either *'and'* or *'or'* with the second being the expression. The final two parameters are the same as any normal chaining query function.
  
  **HTML**
   ```html
  <form class="form form-inline">
	  <label for="fName">Type Name</label>
	  <input type="text" id="fName" class="form-control"></input>
	  <button type="button" id="myBtn" class="btn">Get Me</button>
	</form>
  ```
  **JS**
  ```javascript
  $('#myBtn').click(function() {
    db.select('languages_I', {
      ret: '*'
    })
    .where('neq', { name: null })
    .conditional('and', $('#fName').val(), 'eq', { name: $('#fName').val() })
  });
  ```
  
  Here, if the string 'JavaScript' was entered into the *fName* input box, the **activeQuery** would return:
  
  name | ext
  ----- | -----
  JavaScript | .js
 
### Sorting
  
  The **activeQuery** data can be sorted by using the **orderBy** chain. This takes as its first argument a column name from the **activeQuery**. If the second optional argument is true, the data will be sorted in ascending order:
  
  ```javascript
  db.select('languages_I', {
    ret: ['name']
  }).orderBy('name')
  ```
   **AS sql:**
  ```sql
  select name from languages_I order by name
  ```
  This will return:
  
  name | 
  ----- | 
  C# |
  JavaScript |
  Python |

### Joining

 Column joins can be performed on tables within the same Db by using the **.join** chain. This takes four arguments. 
 
 + The first is the name of the table you wish to extract a column from. 
 + Secondly, the name of the column you wish to add. 
 + The third argument is a key:value pair specifying the matching columns between the two tables. The key should be the column from the first table, with the value being the column from the second table. 
 + An additional *alias* argument can be passed which will name the newly created column (otherwise it will default as the value in the previous argument). 
  
 If no matches are found, null will be used as the property value:
 
 ```javascript
 db.select('languages_I', {
   ret: '*'
 }).join('languages_II', 'typed', {
   name: 'name'
 }, 'typing type');
 ```
 
  **AS sql:**
  ```sql
  select a.*, b.typed as [typing type] from languages_I as a left join languages_II as b on a.name = b.name
  ```
 
 Will return:
 
 name | ext | typing type
  ----- | ----- | ----
  JavaScript | .js | weakly
  C# | .cs | strongly	
  Python | .py | dynamically

### Insert, Update and Remove

To insert data into a table within Db:

```javascript
db.insert('languages_I', {
  data: [
    { name: 'Perl', ext: '.pl' },
    { name: 'SQL' },
  ]
});
```
**AS sql:**
```sql
insert into languages_I (name, ext) values ('Perl', '.pl'), ('SQL', null)
```

**.insert** takes an object with an array value. Any columns not specified in the insert query which do not exist will default to null. The above **activeQuery** will become:

name | ext 
  ----- | -----
  JavaScript | .js  
  C# | .cs 	
  Python | .py 
  Perl | .pl 	
  SQL | null
  
 An update can be made by specifying a single key:value pair *where* object. The resulting *update* object can amend as many columns as required:
 
 ```javascript
 db.update('languages_I', {
   where: { name: 'SQL' },
   update: { ext: '.sql' }
 });
 ```
 **AS sql:**
```sql
update languages_I set ext = '.sql' where name = 'SQL'
```
 
 Result: 
 
 name | ext 
  ----- | -----
  JavaScript | .js  
  C# | .cs 	
  Python | .py 
  Perl | .pl 	
  SQL | .sql

Entire rows are deleted by using the **.remove** function.

```javascript
db.remove('languages_I', {
  where: { name: 'SQL' }
});

db.remove('languages_I', {
  where: { name: 'Perl	' }
});
```
 **AS sql:**
```sql
delete * from languages_I where name = 'SQL'
```
```sql
delete * from languages_I where name = 'Perl'
```

Output: 

name | ext 
  ----- | -----
  JavaScript | .js  
  C# | .cs 	
  Python | .py 

### Operators for chain Queries

```javascript
'eq' || '='		
// Equal To (case sensitive)
'neq' || '!='		
// Not Equal To (case sensitive)
'gt' || '>'		
// Greater Than
'lt' || '<'		
// Less Than
'gte' || '>='		
// Greater Than or Equal To
'lte' || '<='		
// Less Than or Equal To
'beginsWith' || '_.'
// Begins With (case sensitive)
'endsWith' || '._'	
// Ends With (case sensitive)
'isLike' || '%'		
// Is Like (not case sensitive)
'in' || '><'	  	
// In (['one', 'two'] case sensitive)
'notIn' || '!><'	
// Not In (['one', 'two'] case sensitive)
'regexp'                
// Use a regular expression for comparison (if regexp.exec(value) !== null then returned)
```
