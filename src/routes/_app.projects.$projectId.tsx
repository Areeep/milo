import { createFileRoute } from '@tanstack/react-router'
import { ProjectLayout } from '#/features/projects/ProjectLayout'

export const Route = createFileRoute('/_app/projects/$projectId')({
  component: () => {
    const { projectId } = Route.useParams()
    return <ProjectLayout projectId={projectId} />
  },
})
