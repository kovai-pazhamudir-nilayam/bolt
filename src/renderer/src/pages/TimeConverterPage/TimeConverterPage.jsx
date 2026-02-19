import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  InputNumber,
  Row,
  Space,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { ChevronDown, Copy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import './TimeConverterPage.less'

dayjs.extend(utc)
dayjs.extend(timezone)

const { Title, Text } = Typography

const TimeConverterPageWOC = ({ renderSuccessNotification }) => {
  const [epoch, setEpoch] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())

  const getHumanReadable = (date, timeZone) => {
    if (!date || isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const updateAllFromDate = useCallback((date, source) => {
    if (!date || isNaN(date.getTime())) {
      if (source !== 'epoch') setEpoch(null)
      return
    }

    if (source !== 'epoch') setEpoch(Math.floor(date.getTime() / 1000))
  }, [])

  const getCopyMenu = (date) => {
    if (!date || isNaN(date.getTime())) return { items: [] }
    const d = dayjs(date)
    const items = [
      { key: 'iso', label: 'ISO 8601', value: d.toISOString() },
      {
        key: 'epoch',
        label: 'Unix Epoch (s)',
        value: Math.floor(date.getTime() / 1000).toString()
      },
      {
        key: 'ist',
        label: 'IST Format',
        value: d.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
      },
      { key: 'readable', label: 'Human Readable', value: getHumanReadable(date, 'Asia/Kolkata') }
    ]

    return {
      items: items.map((item) => ({
        key: item.key,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span>{item.label}</span>
            <Text type="secondary" size="small" code>
              {item.key === 'iso' ? item.value.substring(0, 20) + '...' : item.value}
            </Text>
          </div>
        ),
        onClick: () => {
          navigator.clipboard.writeText(item.value)
          renderSuccessNotification({ message: `Copied as ${item.label}` })
        }
      }))
    }
  }

  const handleEpochChange = (val) => {
    setEpoch(val)
    if (val === null || val === undefined) {
      updateAllFromDate(null, 'epoch')
    } else {
      updateAllFromDate(new Date(val * 1000), 'epoch')
    }
  }

  const handleDateChange = (date, source) => {
    if (!date) {
      updateAllFromDate(null, source)
      return
    }
    const jsDate = date.toDate()
    updateAllFromDate(jsDate, source)
  }

  return (
    <div className="TimeConverterPage">
      <PageHeader
        title="Time Converter"
        description="Switch between Epoch, IST, and UTC time formats instantly."
      />

      <div className="converter_container">
        <div className="live_clock_bar">
          <div className="live_item">
            <Text type="secondary" size="small">
              LIVE EPOCH
            </Text>
            <Text strong className="live_value">
              {Math.floor(liveTime.getTime() / 1000)}
            </Text>
          </div>
          <Divider type="vertical" />
          <div className="live_item">
            <Text type="secondary" size="small">
              LIVE IST
            </Text>
            <Text strong className="live_value">
              {getHumanReadable(liveTime, 'Asia/Kolkata')}
            </Text>
          </div>
          <Divider type="vertical" />
          <div className="live_item">
            <Text type="secondary" size="small">
              LIVE UTC
            </Text>
            <Text strong className="live_value">
              {getHumanReadable(liveTime, 'UTC')}
            </Text>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card title="UTC (Greenwich Mean Time)" className="time_card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <DatePicker
                  showTime
                  allowClear
                  value={epoch ? dayjs(epoch * 1000).utc() : null}
                  onChange={(date) => handleDateChange(date, 'utc')}
                  placeholder="Paste ISO-8601 or select"
                  className="time_picker"
                  style={{ width: '100%' }}
                  format={[
                    'YYYY-MM-DD HH:mm:ss',
                    'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                    'YYYY-MM-DDTHH:mm:ss.SSSZ',
                    'YYYY-MM-DDTHH:mm:ssZ',
                    'YYYY-MM-DD'
                  ]}
                />
                <div className="readable_preview">
                  {epoch ? getHumanReadable(new Date(epoch * 1000), 'UTC') : 'Enter UTC time'}
                </div>
                <Dropdown
                  menu={getCopyMenu(epoch ? new Date(epoch * 1000) : null)}
                  disabled={!epoch}
                >
                  <Button icon={<Copy size={14} />} block disabled={!epoch}>
                    Copy Options <ChevronDown size={14} />
                  </Button>
                </Dropdown>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="IST (Asia/Kolkata)" className="time_card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <DatePicker
                  showTime
                  allowClear
                  value={epoch ? dayjs(epoch * 1000).tz('Asia/Kolkata') : null}
                  onChange={(date) => handleDateChange(date, 'ist')}
                  placeholder="Select IST Time"
                  className="time_picker"
                  style={{ width: '100%' }}
                  format={[
                    'YYYY-MM-DD HH:mm:ss',
                    'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                    'YYYY-MM-DDTHH:mm:ss.SSSZ',
                    'YYYY-MM-DDTHH:mm:ssZ',
                    'YYYY-MM-DD'
                  ]}
                />
                <div className="readable_preview">
                  {epoch
                    ? getHumanReadable(new Date(epoch * 1000), 'Asia/Kolkata')
                    : 'Enter IST time'}
                </div>
                <Dropdown
                  menu={getCopyMenu(epoch ? new Date(epoch * 1000) : null)}
                  disabled={!epoch}
                >
                  <Button icon={<Copy size={14} />} block disabled={!epoch}>
                    Copy Options <ChevronDown size={14} />
                  </Button>
                </Dropdown>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Unix Epoch (Seconds)" className="time_card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <InputNumber
                  value={epoch}
                  onChange={handleEpochChange}
                  className="time_input"
                  style={{ width: '100%' }}
                  placeholder="Enter Epoch"
                />
                <div className="readable_preview">
                  {epoch ? getHumanReadable(new Date(epoch * 1000), 'Asia/Kolkata') : 'Enter Epoch'}
                </div>
                <Dropdown
                  menu={getCopyMenu(epoch ? new Date(epoch * 1000) : null)}
                  disabled={!epoch}
                >
                  <Button icon={<Copy size={14} />} block disabled={!epoch}>
                    Copy Options <ChevronDown size={14} />
                  </Button>
                </Dropdown>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '40px 0' }}>Quick Conversion Guide</Divider>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card size="small" className="info_card">
              <Title level={5}>Epoch to IST/UTC</Title>
              <Text type="secondary">
                Unix epoch time is the number of seconds that have elapsed since January 1, 1970.
                Enter any epoch value on the left to see its equivalent in IST and UTC.
              </Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" className="info_card">
              <Title level={5}>IST/UTC to Epoch</Title>
              <Text type="secondary">
                Enter time in <code>YYYY-MM-DD HH:mm:ss</code> format in either the IST or UTC
                fields to calculate the corresponding Unix Epoch timestamp.
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

const TimeConverterPage = withNotification(TimeConverterPageWOC)

export default TimeConverterPage
