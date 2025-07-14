import { Resource } from "../types/prod";

const predefinedResources : Resource[] = [
    { id: '1', name: 'CNC Machine', status: 'Available' },
    { id: '2', name: 'Assembly Line', status: 'Available' },
    { id: '3', name: '3D Printer', status: 'Busy' },
    { id: '4', name: 'Printer', status: 'Available' },
];

export default predefinedResources;