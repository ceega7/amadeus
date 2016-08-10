# amadeus.js

// installation by script tags && Node Module

### .Db

  ```javascript
  var db = new amadeus.Db({
    name: 'mdb'
  });
  ```
  Db takes an object with a single 'name' property.
  
### .Db.createTable

  Tables can be created with basic arrays and nested objects
  
  Array:
  
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
  
  Object:
  
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
  
  Following initialisation, the tables above can be queried using the amadeus query syntax. Querying, will create a carbon copy of the table's data property which can be amended and used as appropriate.
  
  languages_I
  
  | name          | ext           | 
  | ------------- |:-------------:| 
  | JavaScript      | .js | 
  | C#     | .cs      |   
  | Python | .py     |
  
  | Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
