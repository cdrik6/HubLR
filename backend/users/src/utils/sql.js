export async function execute(db, sql, params = []){
	if (params && params.length > 0) {
		return new Promise((resolve, reject) => {
			db.run(sql, params, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}
	return new Promise((resolve, reject) => {
		db.exec(sql, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
};

export async function fetchAll(db, sql, params) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			resolve(rows);
		});
	});
};

export async function fetchFirst(db, sql, params) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject(err);
			resolve(row);
		});
	});
};

export async function closeDb(db) {
	return new Promise((resolve, reject) => {
		db.close((err) => {
			if (err) {
				console.error("Error closing users DataBase:", err);
				reject(err);
			}
			else {
				console.log("Closing users DataBase");
				resolve();
			}
		});
	});
}