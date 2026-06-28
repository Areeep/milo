import { createFileRoute } from '@tanstack/react-router'
import { ProjectSettings } from '#/features/projects/ProjectSettings'

export const Route = createFileRoute('/_app/projects/$projectId/settings')({
  component: () => {
    const { projectId } = Route.useParams()
    return <ProjectSettings projectId={projectId} />
  },
})
