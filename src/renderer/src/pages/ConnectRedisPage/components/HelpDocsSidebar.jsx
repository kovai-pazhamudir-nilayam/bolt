import { Card, Typography } from 'antd'
import { BookOpen } from 'lucide-react'

const { Title, Text } = Typography

const REDIS_DOCS = [
  {
    category: 'Basic Commands',
    commands: [
      { key: 'PING', desc: 'Test connection' },
      { key: 'SET key value', desc: 'Set key to hold string value' },
      { key: 'GET key', desc: 'Get value of key' },
      { key: 'DEL key', desc: 'Delete a key' },
      { key: 'EXISTS key', desc: 'Check if key exists' }
    ]
  },
  {
    category: 'Querying Keys',
    commands: [
      { key: "KEYS '*'", desc: 'List all keys (use with caution)' },
      { key: 'SCAN 0', desc: 'Incrementally iterate over keys' },
      { key: 'TYPE key', desc: 'Determine type of data at key' },
      { key: 'TTL key', desc: 'Get time to live for a key' }
    ]
  }
]

const HelpDocsSidebar = ({ onCommandClick }) => {
  return (
    <Card
      title={
        <span>
          <BookOpen size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          Help Docs
        </span>
      }
      bordered={false}
    >
      <Typography>
        {REDIS_DOCS.map((section) => (
          <div key={section.category} style={{ marginBottom: 24 }}>
            <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
              {section.category}
            </Title>
            {section.commands.map((cmd) => (
              <div
                key={cmd.key}
                style={{ marginBottom: 16, cursor: 'pointer' }}
                onClick={() => onCommandClick(cmd.key.split(' ')[0])}
              >
                <Text strong code style={{ color: '#1890ff', display: 'block' }}>
                  {cmd.key}
                </Text>
                <Text type="secondary" size="small">
                  {cmd.desc}
                </Text>
              </div>
            ))}
          </div>
        ))}
      </Typography>
    </Card>
  )
}

export default HelpDocsSidebar
