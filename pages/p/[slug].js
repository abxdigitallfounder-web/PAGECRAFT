// pages/p/[slug].js
// Página pública publicada — renderiza HTML/CSS salvo no Supabase.
// Não exige autenticação (RLS permite SELECT em pages com published = true).

import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

export async function getServerSideProps({ params, res }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('pages')
    .select('title, html, css, published')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !data) {
    return { notFound: true }
  }

  // Cache leve no edge / browser
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  return {
    props: {
      title: data.title || 'Página',
      html: data.html || '',
      css: data.css || '',
    },
  }
}

export default function PublicPage({ title, html, css }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </Head>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
