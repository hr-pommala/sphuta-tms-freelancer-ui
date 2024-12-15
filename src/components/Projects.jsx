import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const response = await axios.get('/api/projects');
        setProjects(response.data);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('/api/projects', formData);
        fetchProjects();
    };

    return (
        <div>
            <h2>Projects</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
                <button type="submit">Add Project</button>
            </form>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>{project.name}: {project.description}</li>
                ))}
            </ul>
        </div>
    );
};

export default Projects;
