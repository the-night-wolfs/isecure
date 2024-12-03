// try {
const database = async (dbname, method, storename, data = null) => {
    let req_promise = new Promise((resolve, reject) => {
        let request = indexedDB.open(dbname, 1);
        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(storename)) {
                console.log('not present')
                db.createObjectStore(storename, { keyPath: 'id' });
            }
        };

        request.onsuccess = function (event) {
            let response = {
                dbStatus: true
            }
            console.log('Database created successfully');
            let db = event.target.result;
            if (method == 'GET_DATA') {
                let transaction = db.transaction([storename], 'readonly');
                let objectStore = transaction.objectStore(storename);
                let getRequest = objectStore.get(data); // Fetch record with key 1
                getRequest.onsuccess = function (event) {
                    console.log('Data retrieved:', getRequest.result);
                    response = {
                        ...response,
                        dataStatus: true,
                        data: getRequest.result
                    }
                    resolve(response);
                };

                getRequest.onerror = function (event) {
                    console.error('Error retrieving data:', event.target.errorCode);
                    response = {
                        ...response,
                        dataStatus: false,
                        error: event.result.errorCode
                    }
                    resolve(response);
                };
            }
            else if (method == 'ADD_DATA') {
                let transaction = db.transaction([storename], 'readwrite');
                let objectStore = transaction.objectStore(storename);
                let addRequest = objectStore.put(data);
                addRequest.onsuccess = function (event) {
                    response = {
                        ...response,
                        dataStatus: true
                    };
                    resolve(response);
                };
                addRequest.onerror = function (event) {
                    console.error('Error adding data:', event.target.errorCode);
                    response = {
                        ...response,
                        dataStatus: false,
                        error: event.target.errorCode
                    };
                    resolve(response); // Add resolve to ensure the promise is resolved
                };

            }
        };

        request.onerror = function (event) {
            console.log('An error occurred: ' + event.target.errorCode);
        };
    });
    return await req_promise;
}
const checkObjectstore = async (dbname, storename, condition) => {
    let promise = new Promise((resolve) => {
        let checkRequest = indexedDB.open(dbname, 1);
        checkRequest.onsuccess = function (event) {
            let db = event.target.result;
            let checkObj = db.objectStoreNames.contains(storename);
            if (!condition) {
                checkObj == true ? resolve(true) : resolve(false);
            } else {
                if (!checkObj) {
                    console.log('not present')
                    db.createObjectStore(storename, { keyPath: 'id' });
                    resolve(true);
                }
            }
        }
    });
    return await promise;
}
const storecount = async (dbname, storename) => {
    let countPromise = new Promise((resolve, reject) => {
        let request = indexedDB.open(dbname, 1);

        request.onsuccess = function (event) {
            let db = event.target.result;
            console.log(db.objectStoreNames.contains(storename));

            if (db.objectStoreNames.contains(storename)) {
                let transaction = db.transaction(storename, 'readonly');
                let objectStore = transaction.objectStore(storename);
                let countRequest = objectStore.count();

                countRequest.onsuccess = function (event) {
                    let count = event.target.result;
                    resolve(count);
                };

                countRequest.onerror = function (event) {
                    reject(event.target.errorCode);
                };
            } else {
                console.log('Error: object store does not exist');
                resolve(false);
            }
        };

        request.onerror = function (event) {
            console.log('Error opening database:', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });

    let count_res = await countPromise;
    return count_res;
};

// } catch (error) {
// console.log(error);
// }