'use strict';

var amadeus = (function() {
	var a = {};
	a.dbs = [];
	a.init = function(d) {
		for(var i = 0; i < amadeus.dbs.length; i+=1) {
			if(amadeus.dbs[i].name === d) {
				return amadeus.dbs[i];
			}
		}
		throw "amadeus err Db '" + d + "' does not exist";
	}
	a.getType = function(o) {
		return Object.prototype.toString.call(o).split('[object ')[1].slice(0,-1).toLowerCase();
	}
	a.validTableObj = ['type','name','data','columns', 'limit', 'assume', 'addId', 'objConvert', 'arrConvert', 'server', 'collection', 'timeout'];
	a.validTypes = ['standard','object', 'query'];
	a.operators = ['eq','neq', 'gt', 'lt', 'gte', 'lte', 'isLike', 'beginsWith', 'endsWith', 'in', 'notIn', 'regexp'];
	a.objOperators = {'=':'eq', '!=':'neq', '>':'gt', '<':'lt', '>=':'gte', '<=':'lte', '%':'isLike', '._':'beginsWith', '_.':'endsWith', '><':'in', '!><':'notIn', 'regexp':'regexp'};
	return a;
}());

(function(amadeus) {
	amadeus.Db = function(obj) {
		if(!obj) {
			throw "amadeus err :: obj must contain a name property";
		}
		if(!obj.hasOwnProperty('name')) {
			throw "amadeus err :: obj must contain a name property";
		}
		if(amadeus.dbs.indexOf('name') >= 0) {
			throw "amadeus err :: '" + obj.name + "' is already a database in this session";
		}
		this.name = obj.name;
		this.tables = [];
		this.active = false;
		this.activeTable;
		this.queries = [];
		this.init();
	};
	amadeus.Db.prototype.init = function() {
		amadeus.dbs.push(this);
		this.active = true;
	};
	amadeus.Db.prototype.tableExists = function(t) {
		for(var i = 0; i < this.tables.length; i+=1) {
			if(this.tables[i].name === t) {
				return this.tables[i];
			}
		}
		for(var i = 0; i < this.queries.length; i+=1) {
			if(this.queries[i].name === t) {
				return this.queries[i];
			}
		}
		throw "amadeus err :: no Table or Query called '" + t + "' was found";
	}
	amadeus.Db.prototype.tableCount = function() {
		return this.tables.length;
	};
	amadeus.Db.prototype.createTable = function(obj) {
		if(!obj) {
			throw "amadeus err :: Table must have an object argument";
		}
		if(!obj.hasOwnProperty('name')) {
			throw "amadeus err :: obj argument must contain a name property";
		}
		if(this.tables.indexOf(obj.name) >= 0) {
			throw "amadeus err :: Table '" + t + "' already exists";
		}
		var tbl = new amadeus.Table(obj);
		this.tables.push(tbl);
		return this;
	}
	amadeus.Db.prototype.select = function(t, obj) {
		var tbl = this.tableExists(t);
		if(!obj) {
			throw "amadeus err :: object must be used as an argument";
		}
		if(!obj.hasOwnProperty('ret')) {
			throw "amadeus err :: object must contain a 'ret' property";
		}
		if(obj.hasOwnProperty('alias')) {
			if(amadeus.getType(obj.ret) !== 'array') {
				throw "amadeus err :: 'ret' must be an array is 'alias' is used";
			}
			if(amadeus.getType(obj.alias) !== 'array') {
				throw "amadeus err :: 'alias' must be an array";
			}
			if(obj.alias.length !== obj.ret.length) {
				throw "amadeus err :: 'ret' and 'alias' must contain the same columns";
			}
			if(obj.alias.indexOf('id_') >= 0) {
				throw "amadeus err :: columns cannot be named 'id_'";
			}
			if(obj.alias.indexOf('lm_') >= 0) {
				throw "amadeus err :: columns cannot be named 'lm_'";
			}
		}
		this.activeTable = tbl;
		tbl.select_(obj);
		return this;
	};
	amadeus.Db.prototype.conditional = function(t, exp, op, obj) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		var types = ['or', 'and'];
		if(types.indexOf(t) < 0) {
			throw "amadeus err :: conditional type must be 'and' or 'or'";
		}
		if(exp) {
			if(t === 'or') {
				this.activeTable.or_(op, obj);
			}
			if(t === 'and') {
				this.activeTable.and_(op, obj);
			}
		}
		return this;
	};
	amadeus.Db.prototype.where = function(op, obj) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.where_(op, obj);
		return this;
	};
	amadeus.Db.prototype.and = function(op, obj) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.and_(op, obj);
		return this;
	};
	amadeus.Db.prototype.or = function(op, obj) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.or_(op, obj);
		return this;
	};
	amadeus.Db.prototype.orderBy = function(c, boo) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.orderBy_(c, boo);
		return this;
	};
	amadeus.Db.prototype.join = function(t, col, comp, alias) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		var tbl2 = this.tableExists(t);
		var d = tbl2.data;
		this.activeTable.join_(d, col, comp, alias);
		return this;
	};
	amadeus.Db.prototype.use = function(fn) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.use_(fn);
		return this;
	};
	amadeus.Db.prototype.toPretty = function() {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.toPretty_();
		return this;
	}
	amadeus.Db.prototype.toTable = function(id) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		this.activeTable.toTable_(id);
		return this;
	}
	amadeus.Db.prototype.insert = function(t, obj) {
		var tbl = this.tableExists(t);
		if(!obj) {
			throw "amadeus err :: object must be used as an argument";
		}
		if(!obj.hasOwnProperty('data')) {
			throw "amadeus err :: object must contain a 'data' property";
		}
		if(amadeus.getType(obj.data) !== 'array') {
			throw "amadeus err :: data must be an array";
		}
		this.activeTable = tbl;
		tbl.insert_(obj);
		return this;
	};
	amadeus.Db.prototype.update = function(t, obj) {
		var tbl = this.tableExists(t);
		if(!obj) {
			throw "amadeus err :: object must be used as an argument";
		}
		if(!obj.hasOwnProperty('update') || !obj.hasOwnProperty('where')) {
			throw "amadeus err :: object must contain a 'where' and 'update' property";
		}
		if(amadeus.getType(obj.update) !== 'object' || amadeus.getType(obj.where) !== 'object') {
			throw "amadeus err :: 'where' and 'update' must be objects";
		}
		this.activeTable = tbl;
		tbl.update_(obj);
		return this;
	};
	amadeus.Db.prototype.remove = function(t, obj) {
		var tbl = this.tableExists(t);
		if(!obj) {
			throw "amadeus err :: object must be used as an argument";
		}
		if(!obj.hasOwnProperty('where')) {
			throw "amadeus err :: object must contain a 'where' property";
		}
		if(amadeus.getType(obj.where) !== 'object') {
			throw "amadeus err :: 'where' must be an object";
		}
		this.activeTable = tbl;
		tbl.remove_(obj);
		return this;
	};
	amadeus.Db.prototype.batchRemove = function() {
		if(!this.activeTable || this.activeTable == '') {
			throw "amadeus err :: no activeTable";
		}
		if(this.activeTable.getColumns().indexOf('id_') < 0) {
			throw "amadeus err :: batchRemove cannot be used on activeQueries which do not have an id_ column";
		}
		var arr = [];
		for(var i = 0; i < this.activeTable.activeQuery.length; i+=1) {
			this.activeTable.remove_({ where: { id_: this.activeTable.activeQuery[i].id_ }} )
			arr.push(this.activeTable.activeQuery[i]);
		}
		this.activeQuery = '';
		this.selectQuery = '';
		return this;
	};
	amadeus.Db.prototype.batchUpdate = function(obj) {
		if(!this.activeTable || this.activeTable == '') {
			throw "amadeus err :: no activeTable";
		}
		if(this.activeTable.getColumns().indexOf('id_') < 0) {
			throw "amadeus err :: batchUpdate cannot be used on activeQueries which do not have an id_ column";
		}
		var arr = [];
		for(var i = 0; i < this.activeTable.activeQuery.length; i+=1) {
			this.activeTable.update_({ 
				where: { id_: this.activeTable.activeQuery[i].id_ }, 
				update: obj.update
			})
			arr.push(this.activeTable.activeQuery[i]);
		}
		this.activeQuery = '';
		this.selectQuery = '';
		return this;
	};
	amadeus.Db.prototype.save = function(n) {
		if(!this.activeTable || this.activeTable == undefined || this.activeTable === '') {
			throw "amadeus err :: there is no activeTable";
		}
		for(var i = 0; i < this.queries.length; i+=1) {
			if(this.queries[i].name === n) {
				throw "amadeus err:: Query '" + n + "' already exists";
			}	
		}
		var tbl = new amadeus.Table({
			name: n,
			type: 'query',
			data: this.activeTable.activeQuery
		})
		this.queries.push(tbl);
		return this;
	};
	return amadeus;
})(amadeus || {});


(function(amadeus) {
	amadeus.Table = function(obj) {
		if(!obj) {
			throw "amadeus err :: Table must have an object argument";
		}
		if(!obj.hasOwnProperty('name')) {
			throw "amadeus err :: obj argument must contain a name property";
		}
		for(var o in obj) {
			if(amadeus.validTableObj.indexOf(o) < 0) {
				throw "amadeus err :: '" + o + "' is not a valid obj property";
			}
		}
		this.name = obj.name;
		this.activeQuery;
		this.selectQuery;
		if(!obj.hasOwnProperty('type')) {
			throw "amadeus err :: Table must be a type";
		} else {
			if(amadeus.validTypes.indexOf(obj.type) < 0) {
				throw "amadeus err :: '" + obj.type + "' is not a valid Table type";
			}
			this.type = obj.type;
			if(this.type === 'query') {
				var o = obj.data
				this.data = o;
				this.columns = [];
				if(obj.assume) {
					for(var items in o[0]) {
						this.columns.push(
							{
								name: items,
								dataType: amadeus.getType(o[0][items])
							}
						)
					}
				} else {
					for(var items in o[0]) {
						this.columns.push(
							{
								name: items,
								dataType: 'free'
							}
						)
					}
				}
				var f = [];
				for(var i = 0; i < this.columns.length; i+=1) {
					f.push(this.columns[i].name);
				}
				if(f.indexOf('id_') < 0 && f.indexOf('lm_') < 0) {
					this.addId();
				}
			} else if(this.type === 'object') {
				if(!obj.hasOwnProperty('data')) {
					throw "amadeus err :: 'object' Table type must have a data property";
				}
				if(amadeus.getType(obj.data) === 'array') {
					if(obj.hasOwnProperty('limit')) {
						if(amadeus.getType(obj.limit) !== 'array') {
							throw "amadeus err :: limit must be an array";
						}
						var o = [];
						var f = {};
						for(var i = 0; i < obj.data.length; i+=1) {
							f = {};
							for(var items in obj.data[i]) {
								if(obj.limit.indexOf(items) >= 0) {
									f[items] = obj.data[i][items];
								}
							}
							o.push(f);
						}
					} else {
						var o = [];
						for(var i = 0; i < obj.data.length; i+=1) {
							o.push(obj.data[i]);
						}
					}
					if(obj.hasOwnProperty('objConvert')) {
						for(var i = 0; i < o.length; i+=1) {
							for(var items in o[i]) {
								for(var props in obj.objConvert) {
									if(props === items) {
										if(obj.objConvert[items] === 'stringify') {
											o[i][items] = JSON.stringify(o[i][items]);
										} else {
											o[i][items] = o[i][items][obj.objConvert[items]];
										}
									}
								}
							}
						}
					}
					if(obj.hasOwnProperty('arrConvert')) {
						for(var i = 0; i < o.length; i+=1) {
							for(var items in o[i]) {
								for(var props in obj.arrConvert) {
									if(props === items) {
										if(obj.arrConvert[items] === 'stringify') {
											o[i][items] = JSON.stringify(o[i][items]);
										} else if(obj.arrConvert[items] === 'count') {
											o[i][items] = o[i][items].length;
										}
									}
								}
							}
						}
					}
					this.data = o;
					this.columns = [];
					if(obj.assume) {
						for(var items in o[0]) {
							this.columns.push(
								{
									name: items,
									dataType: amadeus.getType(o[0][items])
								}
							)
						}
					} else {
						for(var items in o[0]) {
							this.columns.push(
								{
									name: items,
									dataType: 'free'
								}
							)
						}
					}
					if(obj.addId) {
						this.addId();
					}
				} else if(amadeus.getType(obj.data) === 'object') {
					if(obj.hasOwnProperty('limit')) {
						if(amadeus.getType(obj.limit) !== 'array') {
							throw "amadeus err :: limit must be an array";
						}
						var o = [];
						var f = {};
						for(var items in obj.data) {
							f = {};
							for(var recs in obj.data[items]) {
								if(obj.limit.indexOf(recs) >= 0) {
									f[recs] = obj.data[items][recs];
								}
							}
							o.push(f);
						}
					} else {
						var o = [];
						for(var items in obj.data) {
							o.push(obj.data[items]);
						}
					}
					if(obj.hasOwnProperty('objConvert')) {
						for(var i = 0; i < o.length; i+=1) {
							for(var items in o[i]) {
								for(var props in obj.objConvert) {
									if(props === items) {
										if(obj.objConvert[items] === 'stringify') {
											o[i][items] = JSON.stringify(o[i][items]);
										} else {
											o[i][items] = o[i][items][obj.objConvert[items]];
										}
									}
								}
							}
						}
					}
					if(obj.hasOwnProperty('arrConvert')) {
						for(var i = 0; i < o.length; i+=1) {
							for(var items in o[i]) {
								for(var props in obj.arrConvert) {
									if(props === items) {
										if(obj.arrConvert[items] === 'stringify') {
											o[i][items] = JSON.stringify(o[i][items]);
										} else if(obj.arrConvert[items] === 'count') {
											o[i][items] = o[i][items].length;
										}
									}
								}
							}
						}
					}
					this.data = o;
					this.columns = [];
					if(obj.assume) {
						for(var items in o[0]) {
							this.columns.push(
								{
									name: items,
									dataType: amadeus.getType(o[0][items])
								}
							)
						}
					} else {
						for(var items in o[0]) {
							this.columns.push(
								{
									name: items,
									dataType: 'free'
								}
							)
						}
					}
					if(obj.addId) {
						this.addId();
					}
				} else {
					throw "amadeus err :: 'data' is unsupported";
				}
			}
		}
	}
	amadeus.Table.prototype.addId = function() {
		for(var i = 0; i < this.data.length; i+=1) { 
			this.data[i]['id_'] = i;
			this.data[i]['lm_'] = new Date();
		}
		this.columns.push({name: 'id_', dataType: 'number'});
		this.columns.push({name: 'lm_', dataType: 'date'});
	}
	amadeus.Table.prototype.getColumns = function() {
		var arr = [];
		if(!this.activeQuery || this.activeQuery === '') {
			for(var i = 0; i < this.columns.length; i+=1) {
				arr.push(this.columns[i].name);
			}
		} else {
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(arr.indexOf(items) < 0) {
						arr.push(items);
					}
				}
			}
		}
		return arr;
	}
	amadeus.Table.prototype.select_ = function(obj) {
		this.activeQuery = '';
		this.selectQuery = '';
		if(obj.ret === '*') {
			this.activeQuery = this.data;
			this.selectQuery = this.data;
			return this;
		} else {
			if(amadeus.getType(obj.ret) !== 'array') {
				throw "amadeus err :: multiple ret columns must be passed via an array";
			}
			if(this.columns.length <= 0) {
				var arr = [];
				for(var items in this.data[0]) {
					arr.push(items);
				}
				for(var i = 0; i < obj.ret.length; i+=1) {
					if(arr.indexOf(obj.ret[i]) < 0) {
						throw "amadeus err :: column '" + obj.ret[i] + "' does not exist";
					}
				}
				var o = {};
				var j = 0;
				for(var i = 0; i < this.data.length; i+=1) {
					o[j] = {};
					for(var items in this.data[i]) {
						for(var l = 0; l < obj.ret.length; l+=1) {
							if(obj.ret[l] === items) {
								o[j][items] = this.data[i][items];
							}
						}
					}
					j+=1;
				}
			} else {
				for(var i = 0; i < obj.ret.length; i+=1) {
					if(this.getColumns().indexOf(obj.ret[i]) < 0) {
						throw "amadeus err :: column '" + obj.ret[i] + "' does not exist";
					}
				}
				var o = {};
				var j = 0;
				for(var i = 0; i < this.data.length; i+=1) {
					o[j] = {};
					for(var items in this.data[i]) {
						for(var l = 0; l < obj.ret.length; l+=1) {
							if(obj.ret[l] === items) {
								o[j][items] = this.data[i][items];
							}
						}
					}
					j+=1;
				}
			}
		}
		var a = [];
		for(var items in o) {
			a.push(o[items]);
		}
		if(obj.hasOwnProperty('alias')) {
			for(var i = 0; i < a.length; i+=1) {
				for(var items in a[i]) {
					if(a[i].hasOwnProperty(items)) {
						for(var j = 0; j < obj.alias.length; j+=1) {
							if(items === obj.ret[j]) {
								a[i][obj.alias[j]] = a[i][items]
								delete a[i][items]
							}
						}
					}
				}
			}
		}
		this.selectQuery = a;
		this.activeQuery = a;
		return this;
	}
	amadeus.Table.prototype.where_ = function(op, obj) {
		if(!obj || !op) {
			throw "amadeus err :: args 'op' and 'obj' must be passed";
		} 
		if(amadeus.operators.indexOf(op) < 0) {
			if(amadeus.operators.indexOf(amadeus.objOperators[op]) >= 0) {
				op = amadeus.objOperators[op];
			} else {
				throw "amadeus err :: '" + op + "' is not a valid operator";
			}
		}
		if(amadeus.getType(obj) !== 'object') {
			throw "amadeus err :: obj is invalid type";
		}
		for(var x = 0; x < Object.keys(obj).length; x+=1) {
			if(this.getColumns().indexOf(Object.keys(obj)[x]) < 0) {
				throw "amadeus err :: '" + Object.keys(obj)[x] + "' is not a column in this Table";
			}
		};
		if(op === 'eq') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] === obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				}
			}
		} else if(op === 'neq') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] !== obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				}
			}
		} else if(op === 'gt') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] > obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lt') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] < obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'gte') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] >= obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lte') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] <= obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'isLike') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].toLowerCase().indexOf(obj[items].toLowerCase()) >= 0) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'beginsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].slice(0,len) === obj[items].slice(0, len)) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'endsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].slice(-len) === obj[items].slice(-len)) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'in') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(Object.keys(obj)[0] === items) {
						for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
							if(obj[Object.keys(obj)[0]][j] === this.activeQuery[i][items]) {
								o.push(this.activeQuery[i]);
							}
						}
					}
				}
			}
		} else if(op === 'notIn') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
					for(var items in this.activeQuery[i]) {
						if(Object.keys(obj)[0] === items) {
							if(obj[Object.keys(obj)[0]][j] === this.activeQuery[i][items]) {
								console.log(this.activeQuery[i]);
								this.activeQuery.splice(i,1);
								i-=1;
							}
						}
					}
				}
			}
			var o = this.activeQuery;
		} else if(op === 'regexp') {
			if(amadeus.getType(op) === 'regexp') {
				throw "amadeus err :: regexp expected";
			}
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(obj[Object.keys(obj)[0]].exec(this.activeQuery[i][items]) !== null) {
							o.push(this.activeQuery[i]);
						}	
					}
				} 
			}
		}
		this.activeQuery = o;
		return this;
	}
	amadeus.Table.prototype.and_ = function(op, obj) {
		if(!obj || !op) {
			throw "amadeus err :: args 'op' and 'obj' must be passed";
		} 
		if(amadeus.operators.indexOf(op) < 0) {
			if(amadeus.operators.indexOf(amadeus.objOperators[op]) >= 0) {
				op = amadeus.objOperators[op];
			} else {
				throw "amadeus err :: '" + op + "' is not a valid operator";
			}
		}
		if(amadeus.getType(obj) !== 'object') {
			throw "amadeus err :: obj is invalid type";
		}
		for(var x = 0; x < Object.keys(obj).length; x+=1) {
			if(this.getColumns().indexOf(Object.keys(obj)[x]) < 0) {
				throw "amadeus err :: '" + Object.keys(obj)[x] + "' is not a column in this Table";
			}
		};
		if(op === 'eq') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] === obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				}
			}
		} else if(op === 'neq') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] !== obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				}
			}
		} else if(op === 'gt') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] > obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lt') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] < obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'gte') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] >= obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lte') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items] <= obj[items]) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'isLike') {
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].toLowerCase().indexOf(obj[items].toLowerCase()) >= 0) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'beginsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].slice(0,len) === obj[items].slice(0, len)) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'endsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.activeQuery[i][items].slice(-len) === obj[items].slice(-len)) {
							o.push(this.activeQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'in') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(Object.keys(obj)[0] === items) {
						for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
							if(obj[Object.keys(obj)[0]][j] === this.activeQuery[i][items]) {
								o.push(this.activeQuery[i]);
							}
						}
					}
				}
			}
		} else if(op === 'notIn') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
					for(var items in this.activeQuery[i]) {
						if(Object.keys(obj)[0] === items) {
							if(obj[Object.keys(obj)[0]][j] === this.activeQuery[i][items]) {
								console.log(this.activeQuery[i]);
								this.activeQuery.splice(i,1);
								i-=1;
							}
						}
					}
				}
			}
			var o = this.activeQuery;
		} else if(op === 'regexp') {
			if(amadeus.getType(op) === 'regexp') {
				throw "amadeus err :: regexp expected";
			}
			var o = [];
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				for(var items in this.activeQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(obj[Object.keys(obj)[0]].exec(this.activeQuery[i][items]) !== null) {
							o.push(this.activeQuery[i]);
						}	
					}
				} 
			}
		}
		this.activeQuery = o;
		return this;
	};
	amadeus.Table.prototype.or_ = function(op, obj) {
		if(!obj || !op) {
			throw "amadeus err :: args 'op' and 'obj' must be passed";
		} 
		if(amadeus.operators.indexOf(op) < 0) {
			if(amadeus.operators.indexOf(amadeus.objOperators[op]) >= 0) {
				op = amadeus.objOperators[op];
			} else {
				throw "amadeus err :: '" + op + "' is not a valid operator";
			}
		}
		if(amadeus.getType(obj) !== 'object') {
			throw "amadeus err :: obj is invalid type";
		}
		for(var x = 0; x < Object.keys(obj).length; x+=1) {
			if(this.getColumns().indexOf(Object.keys(obj)[x]) < 0) {
				throw "amadeus err :: '" + Object.keys(obj)[x] + "' is not a column in this Table";
			}
		};
		if(op === 'eq') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] === obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				}
			}
		} else if(op === 'neq') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] !== obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				}
			}
		} else if(op === 'gt') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] > obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lt') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] < obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'gte') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] >= obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'lte') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items] <= obj[items]) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'isLike') {
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items].toLowerCase().indexOf(obj[items].toLowerCase()) >= 0) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'beginsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items].slice(0,len) === obj[items].slice(0, len)) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'endsWith') {
			var len = obj[Object.keys(obj)[0]].length;
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(this.selectQuery[i][items].slice(-len) === obj[items].slice(-len)) {
							o.push(this.selectQuery[i]);
						}
					}
				} 
			}
		} else if(op === 'in') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(Object.keys(obj)[0] === items) {
						for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
							if(obj[Object.keys(obj)[0]][j] === this.selectQuery[i][items]) {
								o.push(this.selectQuery[i]);
							}
						}
					}
				}
			}
		} else if(op === 'notIn') {
			var o = [];
			if(amadeus.getType(obj[Object.keys(obj)[0]]) !== 'array') {
				throw "amadeus err :: obj value must be an array for 'in' operator";
			}
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var j = 0; j < obj[Object.keys(obj)[0]].length; j+=1) {
					for(var items in this.selectQuery[i]) {
						if(Object.keys(obj)[0] === items) {
							if(obj[Object.keys(obj)[0]][j] === this.selectQuery[i][items]) {
								console.log(this.selectQuery[i]);
								this.selectQuery.splice(i,1);
								i-=1;
							}
						}
					}
				}
			}
			var o = this.activeQuery;
		} else if(op === 'regexp') {
			if(amadeus.getType(op) === 'regexp') {
				throw "amadeus err :: regexp expected";
			}
			var o = [];
			for(var i = 0; i < this.selectQuery.length; i+=1) {
				for(var items in this.selectQuery[i]) {
					if(items === Object.keys(obj)[0]) {
						if(obj[Object.keys(obj)[0]].exec(this.selectQuery[i][items]) !== null) {
							o.push(this.selectQuery[i]);
						}	
					}
				} 
			}
		}
		for(var i = 0; i < o.length; i+=1) {
			this.activeQuery.push(o[i]);
		}
		var arr = [];
		var jArr = [];
		for(var i = 0; i < this.activeQuery.length; i+=1) {
			if(jArr.indexOf(JSON.stringify(this.activeQuery[i])) < 0) {
				jArr.push(JSON.stringify(this.activeQuery[i]));
				arr.push(this.activeQuery[i])
			}
		}
		this.activeQuery = arr;
		return this;
	};
	amadeus.Table.prototype.orderBy_ = function(c, boo) {
		if(!c) {
			throw "amadeus err :: column to sort must be specified";
		}
		if(this.activeQuery.length <= 0) {
			return this;
		}
		if(this.getColumns().indexOf(c) < 0) {
			throw "amadeus err :: '" + c + "' is not a column within the activeQuery";
		}
		var dSort = function(p) {
			var so = 1;
			if(p[0] === "-") {
				so = -1;
				p = p.substr(1);
			}
			return function (a,b) {
				var r = (a[p] < b[p]) ? -1 : (a[p] > b[p]) ? 1 : 0;
			return r * so;
			}
		}
		var dSortMulti = function() {
			var p = arguments;
			return function (obj1, obj2) {
				var i = 0, r = 0, numProps = p.length;
				while(r === 0 && i < numProps) {
					r = dSort(p[i])(obj1, obj2);
					i+=1;
				}
				return r;
			}
		}
		this.activeQuery.sort(dSort(c));
		if(boo === true) {
			this.activeQuery.reverse();
		}
		return this;
	}
	amadeus.Table.prototype.use_ = function(fn) {
		if(!this.activeQuery || this.activeQuery == '') {
			return this;
		}
		fn(this.activeQuery);
		return this;
	};
	amadeus.Table.prototype.toPretty_ = function() {
		if(!this.activeQuery || this.activeQuery == '') {
			return this;
		}
		console.log(JSON.stringify(this.activeQuery, null, 4));
		return this;
	}
	amadeus.Table.prototype.join_ = function(d, col, comp, alias) {
		if(this.getColumns().indexOf(alias) >= 0) {
			throw "amadeus err :: column '" + alias + "' already exists in this Table";
		}
		if(alias === 'id_' || alias === 'lm_') {
			throw "amadeus err :: '" + alias + "' cannot be overwritten";
		}
		if(col === 'id_' || col === 'lm_') {
			throw "amadeus err :: '" + alias + "' cannot be overwritten";
		}
		var arr = [];
		for(var items in d[0]) {
			arr.push(items);
		}
		if(arr.indexOf(col) < 0) {
			throw "amadeus err :: column '" + col + "' does not exist within the joining Table";
		}
		if(amadeus.getType(comp) !== 'object') {
			throw "amadeus err :: comparison argument must be an argument";
		}
		if(arr.indexOf(comp[Object.keys(comp)[0]]) < 0) {
			throw "amadeus err :: column '" + comp[Object.keys(comp)[0]] + "' does not exist in the joining Table";
		}
		if(this.getColumns().indexOf(Object.keys(comp)[0]) < 0) {
			throw "amadeus err :: column '" + Object.keys(comp)[0] + "' does not exist activeQuery";
		}
		for(var i = 0; i < this.activeQuery.length; i+=1) {
			for(var items in this.activeQuery[i]) {
				var boo = false;
				if(items === Object.keys(comp)[0]) {
					for(var j = 0; j < d.length; j+=1) {
						if(d[j][comp[Object.keys(comp)[0]]] === this.activeQuery[i][items]) {
							this.activeQuery[i][col] = d[j][col];
							boo = true;
						}
					}
					if(!boo) {
						this.activeQuery[i][col] = null;
					}
				}
			}
		}
		if(alias) {
			for(var i = 0; i < this.activeQuery.length; i+=1) {
				this.activeQuery[i][alias] = this.activeQuery[i][col];
				delete this.activeQuery[i][col];
			}
		}
	}
	amadeus.Table.prototype.toTable_ = function(id) {
		if(!this.activeQuery || this.activeQuery == '') {
			return this;
		}
		if(!id) {
			throw "amadeus err :: id must be specified for Table paste";
		}
		document.getElementById(id).innerHTML = '';
		if(this.activeQuery.length <= 0) {
			return false;
		}
		var html = '<table class="table table-hover"><thead><tr>';
		for(var items in this.activeQuery[0]) {
			if(this.activeQuery[0].hasOwnProperty(items)) {
				html += '<th>' + items + '</th>';
			}
		}
		html += '</tr><tbody>';
		for(var i = 0; i < this.activeQuery.length; i+=1) {
			html += '<tr>';
			for(var items in this.activeQuery[i]) {
				if(this.activeQuery[i].hasOwnProperty(items)) {
					html += '<td>' + this.activeQuery[i][items] + '</td>';
				}
			}
			html += '</tr>';
		}
		html += '</tbody></table>';
		document.getElementById(id).innerHTML = html;
		return this;
	}
	amadeus.Table.prototype.getId_ = function() {
		var a = [];
		for(var i = 0 ; i < this.data.length; i+=1) {
			a.push(this.data[i].id_);
		}
		if(a.length > 0) {
			var r = Math.max.apply(Math, a);
			return (r + 1);
		} else {
			return 0;
		}
	}
	amadeus.Table.prototype.insert_ = function(obj) {
		var c = this.getColumns();
		var ro = ['id_', 'lm_'];
		for(var i = 0; i < obj.data.length; i+=1) {
			for(var items in obj.data[i]) {
				if(obj.data[i].hasOwnProperty(items)) {
					if(c.indexOf(items) < 0) {
						throw "amadeus err :: column '" + items + "' does not exist in this Table";
					}
					if(ro.indexOf(items) >= 0) {
						throw "amadeus err :: column '" + items + "' is a Read Only column and cannot be amended";
					}
				}
			}
		}
		if(!obj.useStrict) { // potential to add strict
			for(var i = 0; i < obj.data.length; i+=1) {
				var o = {};
				var ca = [];
				for(var items in obj.data[i]) {
					o[items] = obj.data[i][items];
					ca.push(items);
				}
				for(var j = 0; j < c.length; j+=1) {
					if(ca.indexOf(c[j]) < 0) {
						if(c[j] === 'id_') {
							o[c[j]] = this.getId_();
						} else if(c[j] === 'lm_') {
							o[c[j]] = new Date();
						} else if(c[j] == undefined) {
							// do nothing
						} else {
							o[c[j]] = null;
						}
					}
				}
				this.data.push(o);
			}
		}
		return this;
	};
	amadeus.Table.prototype.update_ = function(obj) {
		var c = this.getColumns();
		var ro = ['id_', 'lm_'];
		var k = 0;
		for(var items in obj.where) {
			if(c.indexOf(items) < 0) {
				throw "amadeus err :: column '" + items + "' does not exist in this Table";
			}
			k +=1;
		}
		if(k > 1) {
			throw "amadeus err :: only one comparison allowed for an update query";
		}
		for(var items in obj.update) {
			if(c.indexOf(items) < 0) {
				throw "amadeus err :: column '" + items + "' does not exist in this Table";
			}
			if(ro.indexOf(items) >= 0) {
				throw "amadeus err :: column '" + items + "' is a Read Only column and cannot be amended";
			}
		}
		for(var i = 0; i < this.data.length; i+=1) {
			for(var items in this.data[i]) {
				if(this.data[i].hasOwnProperty(items)) {
					for(var ups in obj.where) {
						if(ups === items) {
							if(obj.where[ups] === this.data[i][ups]) {
								for(var cons in obj.update) {
									this.data[i][cons] = obj.update[cons];
									if(this.data[i].hasOwnProperty('lm_')) {
										this.data[i]['lm_'] = new Date();
									}
								}
							}
						}
					}
				}
			}
		}
		return this;
	};
	amadeus.Table.prototype.remove_ = function(obj) {
		var c = this.getColumns();
		var k = 0;
		for(var items in obj.where) {
			if(c.indexOf(items) < 0) {
				throw "amadeus err :: column '" + items + "' does not exist in this Table";
			}
			k +=1;
		}
		if(k > 1) {
			throw "amadeus err :: only one comparison allowed for a remove query";
		}
		for(var i = 0; i < this.data.length; i+=1) {
			for(var items in this.data[i]) {
				for(var ups in obj.where) {
					if(ups === items) {
						if(obj.where[ups] === this.data[i][ups]) {
							this.data.splice(i, 1);
							i-=1;
						}
					}
				}
			}
		}
	};
	return amadeus;
})(amadeus || {});

// module.exports = amadeus; // node.js only
