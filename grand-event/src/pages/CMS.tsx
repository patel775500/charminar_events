import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BuilderComponent, builder } from '@builder.io/react'
import '../lib/builder'

export default function CMS(){
  const location = useLocation()
  const [content, setContent] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(()=>{
    const apiKey = import.meta.env.VITE_PUBLIC_BUILDER_KEY as string | undefined
    if(!apiKey){ setError('Builder.io public key is not set.'); return }
    const path = location.pathname.replace(/^\/cms/, '') || '/'
    builder.get('page', { userAttributes: { urlPath: path }}).promise()
      .then((res)=> setContent(res))
      .catch(()=> setError('Failed to load content from Builder.io'))
  },[location.pathname])

  return (
    <div className="mx-auto max-w-6xl">
      {error && <div className="rounded-xl border border-red-200 bg-red-50/10 p-4 text-red-200">{error}</div>}
      {!error && !content && <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">Loading content…</div>}
      {content && <BuilderComponent model="page" content={content} />}
    </div>
  )
}
