import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function ConversationList({ currentUser, onSelectConversation }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [currentUser])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      // Simple query - just get all messages for this user
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Fetch error:', error)
        setConversations([])
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // Get unique partner IDs first
      const partnerIds = [...new Set(data.map(msg => 
        msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
      ))]

      // Batch fetch all partner names in ONE query
      const { data: partners } = await supabase
        .from('users')
        .select('id, name')
        .in('id', partnerIds)

      const partnerMap = Object.fromEntries((partners || []).map(p => [p.id, p.name]))

      // Group messages by partner
      const grouped = {}
      for (const msg of data) {
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
        if (!grouped[partnerId]) {
          grouped[partnerId] = {
            id: partnerId,
            name: partnerMap[partnerId] || 'Unknown',
            lastMessage: msg.content,
            lastTime: msg.created_at,
          }
        }
      }

      setConversations(Object.values(grouped))
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setConversations([])
      setLoading(false)
    }
  }

  return (
    <div className="w-64 border-r border-gray-200 bg-white rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-[#E8F5E9] to-white">
        <h2 className="font-[var(--font-heading)] text-lg text-[#1B5E20]">Messages</h2>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500 text-sm p-4">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="text-center text-gray-500 text-sm p-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id, conv.name)}
              className="w-full text-left border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm text-gray-900">{conv.name}</p>
              <p className="text-xs text-gray-600 mt-1 truncate">{conv.lastMessage}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(conv.lastTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList