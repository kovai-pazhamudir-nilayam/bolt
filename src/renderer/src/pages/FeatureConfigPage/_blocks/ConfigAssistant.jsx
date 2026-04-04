import { Button, Card, Input, Space } from 'antd'
import { Bot, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mockClaudeResponse } from '../featureConfig.helpers'

const ConfigAssistant = () => {
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Hi! I can help you configure feature access. Each feature can be set to Write, Read, or Hidden.'
    }
  ])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSend = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    const reply = mockClaudeResponse(userMsg)
    setChatHistory((h) => [...h, { role: 'user', text: userMsg }, { role: 'assistant', text: reply }])
  }

  return (
    <Card
      title={
        <Space>
          <Bot size={16} />
          Config Assistant
        </Space>
      }
    >
      <div
        style={{
          height: 200,
          overflowY: 'auto',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: 8,
                background: msg.role === 'user' ? '#1677ff' : '#262626',
                color: msg.role === 'user' ? '#fff' : '#d9d9d9',
                fontSize: 13,
                lineHeight: 1.5
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Ask about access levels, hiding features, etc."
        />
        <Button type="primary" icon={<Send size={16} />} onClick={handleSend} />
      </Space.Compact>
    </Card>
  )
}

export default ConfigAssistant
