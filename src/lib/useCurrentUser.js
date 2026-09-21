import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setLoading(false)
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error || !profile) {
          console.error('Profile fetch error:', error)
          console.log('Auth user ID:', authUser.id)
          setUser(null)
          setLoading(false)
          return
        }

        setUser(profile)
      } catch (err) {
        console.error('fetchUser error:', err)
        setUser(null)
      }
      
      setLoading(false)
    }

    fetchUser()

    const { data } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}