import { createFileRoute } from '@tanstack/react-router'
import { ProjectTasks } from '#/features/projects/ProjectTasks'

export const Route = createFileRoute('/_app/projects/$projectId/tasks')({
  component: () => {
    const { projectId } = Route.useParams()
    return <ProjectTasks projectId={projectId} />
  },
})
