import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects/$projectId/analytics')({
  component: () => <div className="p-8">Halaman Analitik</div>,
})
