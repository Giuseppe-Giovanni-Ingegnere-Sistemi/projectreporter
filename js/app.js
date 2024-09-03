class ProjectManager {
    constructor() {
        this.projectDB = new ProjectDB();
        this.editingProjectId = null;
    }

    async init() {
        await this.projectDB.open();
        this.loadProjects();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('projectForm').addEventListener('submit', this.handleFormSubmit.bind(this));
        document.getElementById('generateReport').addEventListener('click', this.generateReport.bind(this));
        document.getElementById('filterProjects').addEventListener('input', this.filterProjects.bind(this));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const project = {
            name: document.getElementById('projectName').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            progress: parseInt(document.getElementById('progress').value)
        };

        if (this.editingProjectId) {
            project.id = this.editingProjectId;
            await this.projectDB.updateProject(project);
            this.editingProjectId = null;
        } else {
            await this.projectDB.addProject(project);
        }

        document.getElementById('projectForm').reset();
        this.loadProjects();
    }

    async loadProjects() {
        const projects = await this.projectDB.getProjects();
        this.renderProjects(projects);
    }

    renderProjects(projects) {
        const tableBody = document.getElementById('projectTableBody');
        tableBody.innerHTML = '';

        projects.forEach(project => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${project.name}</td>
                <td>${this.formatDate(project.startDate)}</td>
                <td>${this.formatDate(project.endDate)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${project.progress}%"></div>
                    </div>
                    ${project.progress}%
                </td>
                <td>
                    <button onclick="projectManager.editProject(${project.id})" class="btn btn-primary"><i class="fas fa-edit"></i></button>
                    <button onclick="projectManager.deleteProject(${project.id})" class="btn btn-secondary"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    async editProject(id) {
        const project = await this.projectDB.getProjectById(id);
        if (project) {
            document.getElementById('projectName').value = project.name;
            document.getElementById('startDate').value = project.startDate;
            document.getElementById('endDate').value = project.endDate;
            document.getElementById('progress').value = project.progress;
            this.editingProjectId = id;
        }
    }

    async deleteProject(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            await this.projectDB.deleteProject(id);
            this.loadProjects();
        }
    }

    async generateReport() {
        const projects = await this.projectDB.getProjects();
        let report = 'Informe de Progreso de Proyectos\n';
        report += `Fecha: ${this.formatDate(new Date().toISOString())}\n\n`;

        projects.forEach(project => {
            const startDate = new Date(project.startDate);
            const endDate = new Date(project.endDate);
            const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

            report += `Proyecto: ${project.name}\n`;
            report += `Progreso: ${project.progress}%\n`;
            report += `Fecha de inicio: ${this.formatDate(project.startDate)}\n`;
            report += `Fecha de finalización: ${this.formatDate(project.endDate)}\n`;
            report += `Días restantes: ${daysRemaining}\n\n`;
        });

        document.getElementById('reportContent').textContent = report;
    }

    filterProjects(e) {
        const filterValue = e.target.value.toLowerCase();
        this.projectDB.getProjects().then(projects => {
            const filteredProjects = projects.filter(project => 
                project.name.toLowerCase().includes(filterValue)
            );
            this.renderProjects(filteredProjects);
        });
    }
}

const projectManager = new ProjectManager();
document.addEventListener('DOMContentLoaded', () => projectManager.init());