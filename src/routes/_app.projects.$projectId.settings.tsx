import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects/$projectId/settings')({
  component: () => <div className="p-8">Halaman Pengaturan</div>,
})
