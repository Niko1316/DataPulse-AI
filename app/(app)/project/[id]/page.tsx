import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectView } from './ProjectView'

export const metadata = { title: 'Project — DataPulse AI' }

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const { data: insights } = await supabase
    .from('document_insights')
    .select('*')
    .eq('project_id', id)
    .single()

  const { data: assets } = await supabase
    .from('generated_assets')
    .select('*')
    .eq('project_id', id)
    .order('platform', { ascending: true })

  return <ProjectView project={project} insights={insights} assets={assets || []} />
}
