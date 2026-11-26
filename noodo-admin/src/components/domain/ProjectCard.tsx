import {projectProgress} from '../../lib/task-progress';
import {Link} from 'react-router-dom';
import {ArrowUpRight, CalendarDays, Layers3} from 'lucide-react';
import type {Project} from '../../data/types';
import {Avatar,StatusBadge} from '../ui';
import {dateLabel} from '../../lib/format';
import {useStore} from '../../data/Store';
export function ProjectCard({project}:{project:Project}){const {db}=useStore();const tasks=db.tasks.filter(t=>t.projectId===project.id);const percent=projectProgress(tasks);return <article className="project-card"><div className="project-card-top"><span className="project-symbol"><Layers3 size={22}/></span><StatusBadge status={project.status}/></div><Link to={`/proyectos/${project.id}`} className="project-title"><h3>{project.name}</h3><ArrowUpRight size={20}/></Link><p className="project-client">{project.client}</p><p className="project-description">{project.description}</p><div className="project-progress"><div><span>Avance del proyecto</span><span>{percent}%</span></div><progress max={100} value={percent} aria-label={`${percent}% completado`}/></div><footer><span className="inline"><Avatar name={project.owner} small/>{project.owner}</span><span className="inline"><CalendarDays size={14}/>{dateLabel(project.deadline)}</span></footer></article>;}
