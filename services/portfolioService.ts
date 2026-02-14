
import { Category, Project } from '../types';
import { PROJECTS as INITIAL_PROJECTS } from '../constants';

const PROJECTS_KEY = 'design_gold_portfolio';

const triggerUpdate = () => {
  window.dispatchEvent(new Event('portfolioUpdated'));
};

export const portfolioService = {
  getProjects: (): Project[] => {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      if (data === null) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading projects:", e);
      return INITIAL_PROJECTS;
    }
  },

  addProject: (project: Omit<Project, 'id'>): Project => {
    const projects = portfolioService.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    try {
      const updatedProjects = [...projects, newProject];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
      triggerUpdate();
      return newProject;
    } catch (e) {
      console.error("Storage error:", e);
      throw new Error("Storage quota exceeded. Please use an Image URL for large files or delete existing projects.");
    }
  },

  updateProject: (id: string, updatedData: Partial<Project>): void => {
    const projects = portfolioService.getProjects();
    const index = projects.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      const updatedProjects = [...projects];
      updatedProjects[index] = { ...projects[index], ...updatedData };
      try {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
        triggerUpdate();
      } catch (e) {
        console.error("Storage error during update:", e);
        throw new Error("Storage quota exceeded. Failed to update project.");
      }
    }
  },

  deleteProject: (projectId: string): void => {
    if (!projectId) return;
    
    // Get latest data from storage
    const projects = portfolioService.getProjects();
    
    // Strict comparison after converting to string to ensure matching
    const filtered = projects.filter(p => String(p.id) !== String(projectId));
    
    try {
      // Save updated list back to localStorage
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
      
      // Trigger update event for real-time UI refresh
      triggerUpdate();
    } catch (e) {
      console.error("Error deleting project:", e);
      throw new Error("Critical system error: Unable to delete project data.");
    }
  }
};
