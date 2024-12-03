let work_input = document.getElementById('work_input');
let work_box = document.getElementById('work-box-001');
let dbname = new Date().toLocaleDateString();
let storename = 'mystore';

// Function to open the IndexedDB and return a promise
const databaseList = async (dbname, storename) => {
    return new Promise((resolve, reject) => {
        let dbstorename='data-list'
        let request = indexedDB.open('DB_list', 1);

        // Create the object store if it doesn't exist
        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(dbstorename)) {
                db.createObjectStore(dbstorename, { keyPath: 'id', autoIncrement: true });

            }
        };

        request.onsuccess = function (event) {
            let db = event.target.result
            let transaction = db.transaction([dbstorename], 'readwrite');
            let objectStore = transaction.objectStore(dbstorename);
            let data = {'dbname':dbname,'storename':storename};
            let addRequest = objectStore.add(data);

            addRequest.onsuccess = function (event) {
                let cursorRequest = objectStore.openCursor();
                cursorRequest.onsuccess = function (event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        let data = cursor.value;
                        let add_element = '<p class="work-00' + data.id + '" id="work-00' + data.id + '-id">' + data.work + '<span id="' + data.id + '">&#10005</span></p>';
                        work_box.insertAdjacentHTML('beforeend', add_element);
                        cursor.continue();
                    }
                };

                cursorRequest.onerror = function (event) {
                    console.error("Error fetching data:", event.target.errorCode);
                };
            };

            addRequest.onerror = function (event) {
                console.error("Error adding data:", event.target.errorCode);
            };
        };

        request.onerror = function (event) {
            reject(event.target.errorCode);
        };
    });
}
const openDatabase = (dbname) => {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(dbname, 1);

        // Create the object store if it doesn't exist
        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(storename)) {
                db.createObjectStore(storename, { keyPath: 'id', autoIncrement: true });

            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.errorCode);
        };
    });
};

const getdata = async (dbname, storename) => {
    try {
        let db = await openDatabase(dbname);  // Open the DB here
        let transaction = db.transaction([storename], 'readonly');
        let objectStore = transaction.objectStore(storename);
        let cursorRequest = objectStore.openCursor();

        cursorRequest.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                let data = cursor.value;
                let add_element = '<p class="work-00' + data.id + '" id="work-00' + data.id + '-id">' + data.work + '<span id="' + data.id + '">&#10005</span></p>';
                work_box.insertAdjacentHTML('beforeend', add_element);
                cursor.continue();
            }
        };

        cursorRequest.onerror = function (event) {
            console.error("Error fetching data:", event.target.errorCode);
        };
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

const addData = async (works, storename) => {
    try {
        let db = await openDatabase(dbname);  // Open the DB here
        let transaction = db.transaction([storename], 'readwrite');
        let objectStore = transaction.objectStore(storename);
        let data = { work: works };
        let addRequest = objectStore.add(data);

        addRequest.onsuccess = function (event) {
            let id = event.target.result;
            let add_element = '<p class="work-00' + id + '" id="work-00' + id + '-id">' + works + '<span id="' + id + '">&#10005</span></p>';
            work_box.insertAdjacentHTML('beforeend', add_element);
        };

        addRequest.onerror = function (event) {
            console.error("Error adding data:", event.target.errorCode);
        };
    } catch (error) {
        console.error("Error adding data:", error);
    }
};

const removeData = async (dbname, storename, id) => {
    let removePromise = new Promise(async (resolve, reject) => {
        let db = await openDatabase(dbname);  // Open the DB here
        let transaction = db.transaction([storename], 'readwrite');
        let objectstore = transaction.objectStore(storename);
        let removeRequest = objectstore.delete(id);

        removeRequest.onsuccess = function () {
            resolve(true);
        };

        removeRequest.onerror = function (event) {
            console.log(event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
    return await removePromise;
};

// Initialize the app by fetching the data
getdata(dbname, storename);
databaseList(dbname,storename)
// Add data on Enter key press
work_input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && work_input.value.trim() !== '') {
        addData(work_input.value.trim(), storename);
        work_input.value = ''; // Clear input
    }
});

// Remove data on click
work_box.addEventListener('click', async function (event) {
    if (event.target.tagName === 'SPAN') {
        let spanId = parseInt(event.target.id, 10); // Ensure id is a number
        let removeRes = await removeData(dbname, storename, spanId);
        if (removeRes) {
            event.target.parentElement.remove();
        } else {
            console.log(removeRes);
        }
    }
});
