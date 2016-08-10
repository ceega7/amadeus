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
  
  Following initialisation, the tables above can be queried using the amadeus query syntax. Querying will create a carbon copy of the table's *'data'* property which can be amended and used as appropriate.
  
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

  Tables can be queried by creating an **activeQuery** object from the table in question. To create an **activeQuery**, the following syntax must be used:
  
  ```javascript
  db.select('languages_I', {
    ret: '*'
  })
  ```
  
  The *'ret'* property takes the '\*' wilcard as a string or a list of columns as an array. Once the **activeQuery** has been created, a query can executed by chaining calls to the *.select* function.
  
  ```javascript
  db.select('languages_I', {
    ret: '*'
  }).where('!=', {
    name: 'JavaScript'
  });
  ```
  
  If printed as a table, the above **activeQuery** would display:
  
  name | ext
  ----- | -----
  C# | .cs
  Python | .py
