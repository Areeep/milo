import { createFileRoute } from '@tanstack/react-router'
import { Projects } from '#/features/projects/Projects'

export const Route = createFileRoute('/_app/projects/')({
  component: Projects,
})
