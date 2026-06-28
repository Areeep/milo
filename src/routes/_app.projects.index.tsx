import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects/')({
  component: () => <div className="p-8">Halaman Proyek</div>,
})
