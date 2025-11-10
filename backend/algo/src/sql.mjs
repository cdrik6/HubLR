// Execute sql (e.g INSERT) on the db (run if params, exec otherwise)
export async function execute(db, sql, params = [])
{
	if (params && params.length > 0)
    {
        return (new Promise(function(resolve, reject)
        {
            db.run(sql, params, function(error)
            {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        }));
    }    
    
    return (new Promise(function(resolve, reject)
    {
        db.exec(sql, function(error)
        {
            if (error)
                reject(error);
            else
                resolve();
        });
    }));
}

// Get all rows from the db
export async function fetchAll(db, sql, params)
{
    return (new Promise(function(resolve, reject)
    {
        db.all(sql, params, function(error, rows)
        {
            if (error)
                reject(error);
            else
                resolve(rows);
        });
    }));
};

// Get the first matching row from the db
export async function fetchFirst(db, sql, params)
{
    return (new Promise(function(resolve, reject)
    {
        db.get(sql, params, function(error, row)
        {
            if (error)
                reject(error);
            else
                resolve(row);
        });
    }));
};



// Tool // The maximum is inclusive and the minimum is inclusive
export function getRandIntInc(min, max)
{
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);   
}