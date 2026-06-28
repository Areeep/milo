import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/team')({
  component: () => <div className="p-8">Halaman Tim</div>,
})
