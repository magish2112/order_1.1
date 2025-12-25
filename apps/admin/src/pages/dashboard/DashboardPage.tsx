import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { apiMethods } from '../../lib/api';
import { DashboardStats, Request } from '../../lib/types';
import {
  MessageSquare,
  CheckCircle,
  ClockCircle,
  Project,
  FileText,
  Users,
} from 'lucide-react';
import dayjs from 'dayjs';

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const response = await apiMethods.stats.getDashboard();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  const requestColumns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          NEW: 'blue',
          IN_PROGRESS: 'orange',
          CONTACTED: 'cyan',
          CONVERTED: 'green',
          REJECTED: 'red',
          SPAM: 'default',
        };
        const labels: Record<string, string> = {
          NEW: 'Новая',
          IN_PROGRESS: 'В работе',
          CONTACTED: 'Связались',
          CONVERTED: 'Конвертирована',
          REJECTED: 'Отклонена',
          SPAM: 'Спам',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      {/* Статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Новые заявки"
              value={stats?.overview.newRequests || 0}
              prefix={<MessageSquare />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Заявок сегодня"
              value={stats?.overview.requestsToday || 0}
              prefix={<ClockCircle />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активных проектов"
              value={stats?.overview.activeProjects || 0}
              prefix={<Project />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Опубликованных статей"
              value={stats?.overview.publishedArticles || 0}
              prefix={<FileText />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Статистика по статусам */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Заявки по статусам">
            <Row gutter={[16, 16]}>
              {stats?.requestsByStatus &&
                Object.entries(stats.requestsByStatus).map(([status, count]) => (
                  <Col span={12} key={status}>
                    <Statistic
                      title={status}
                      value={count}
                      valueStyle={{ fontSize: 24 }}
                    />
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Общая статистика">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Всего заявок"
                  value={stats?.overview.totalRequests || 0}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Сотрудников"
                  value={stats?.overview.activeEmployees || 0}
                  prefix={<Users />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Последние заявки */}
      <Card title="Последние заявки">
        <Table
          dataSource={stats?.recentRequests || []}
          columns={requestColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}

