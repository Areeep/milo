import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects/$projectId/tasks')({
  component: () => <div className="p-8">Halaman Tugas</div>,
})
