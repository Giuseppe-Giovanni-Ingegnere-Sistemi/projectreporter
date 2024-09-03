class ProjectDB {
    constructor() {
        this.dbName = 'projectDB';
        this.storeName = 'projects';
        this.db = null;
    }

    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject("Error opening database");

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
            };
        });
    }

    async addProject(project) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(project);

            request.onerror = () => reject("Error adding project");
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getProjects() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onerror = () => reject("Error getting projects");
            request.onsuccess = () => resolve(request.result);
        });
    }

    async updateProject(project) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(project);

            request.onerror = () => reject("Error updating project");
            request.onsuccess = () => resolve();
        });
    }

    async deleteProject(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onerror = () => reject("Error deleting project");
            request.onsuccess = () => resolve();
        });
    }
}