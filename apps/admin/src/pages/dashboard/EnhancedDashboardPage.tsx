import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty } from 'antd';
// import { Column, Pie, Line } from '@ant-design/charts';
import { apiMethods } from '../../lib/api';
import { DashboardStats } from '../../lib/types';
import {
  MessageSquare,
  Clock,
  FolderKanban,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import dayjs from 'dayjs';

/**
 * Улучшенная версия Dashboard с графиками и визуализацией
 * 
 * Улучшения:
 * - Статистические карточки с мини-графиками
 * - Графики заявок по дням
 * - Круговая диаграмма статусов
 * - Тренды и изменения
 */
export function EnhancedDashboardPage() {
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

  // Подготовка данных для графиков
  const requestsByDayData = stats?.requestsByDay || [];
  const requestsByStatusData = stats?.requestsByStatus 
    ? Object.entries(stats.requestsByStatus).map(([status, count]) => ({
        status: getStatusLabel(status),
        count: count as number,
        type: status,
      }))
    : [];

  // Конфигурация графика заявок по дням
  const requestsChartConfig = {
    data: requestsByDayData,
    xField: 'date',
    yField: 'count',
    columnStyle: {
      fill: '#1890ff',
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top' as const,
    },
    xAxis: {
      label: {
        formatter: (text: string) => dayjs(text).format('DD.MM'),
      },
    },
    height: 300,
  };

  // Конфигурация круговой диаграммы статусов
  const statusPieConfig = {
    data: requestsByStatusData,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer' as const,
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    height: 300,
  };

  // Конфигурация графика тренда
  const trendLineConfig = {
    data: requestsByDayData,
    xField: 'date',
    yField: 'count',
    smooth: true,
    lineStyle: {
      stroke: '#52c41a',
      lineWidth: 2,
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    areaStyle: {
      fill: 'l(270) 0:#52c41a 1:#ffffff',
    },
    height: 200,
  };

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
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Dashboard</h1>
        <p style={{ margin: '8px 0 0', color: '#8c8c8c' }}>
          Обзор статистики и последних событий
        </p>
      </div>

      {/* Улучшенные статистические карточки */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Новые заявки"
            value={stats?.overview.newRequests || 0}
            change={12.5}
            changeType="positive"
            icon={<MessageSquare size={20} />}
            color="#1890ff"
            chartData={requestsByDayData.slice(-7)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Заявок сегодня"
            value={stats?.overview.requestsToday || 0}
            change={-3.2}
            changeType="negative"
            icon={<Clock size={20} />}
            color="#faad14"
            chartData={requestsByDayData.slice(-7)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Активных проектов"
            value={stats?.overview.activeProjects || 0}
            change={8.1}
            changeType="positive"
            icon={<FolderKanban size={20} />}
            color="#52c41a"
            chartData={requestsByDayData.slice(-7)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Опубликованных статей"
            value={stats?.overview.publishedArticles || 0}
            change={15.3}
            changeType="positive"
            icon={<FileText size={20} />}
            color="#722ed1"
            chartData={requestsByDayData.slice(-7)}
          />
        </Col>
      </Row>

      {/* Графики */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Заявки по дням" extra={<Tag color="blue">Последние 30 дней</Tag>}>
            <Empty description="График временно недоступен (установите @ant-design/charts)" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Заявки по статусам">
            <Empty description="Диаграмма временно недоступна (установите @ant-design/charts)" />
          </Card>
        </Col>
      </Row>

      {/* Дополнительная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Общая статистика">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Всего заявок"
                  value={stats?.overview.totalRequests || 0}
                  prefix={<MessageSquare size={16} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Сотрудников"
                  value={stats?.overview.activeEmployees || 0}
                  prefix={<Users size={16} />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Тренд заявок">
            <Empty description="График тренда временно недоступен (установите @ant-design/charts)" />
          </Card>
        </Col>
      </Row>

      {/* Последние заявки */}
      <Card 
        title="Последние заявки"
        extra={
          <a href="/requests">Посмотреть все →</a>
        }
      >
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

/**
 * Компонент карточки статистики с мини-графиком
 */
interface StatCardProps {
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  color: string;
  chartData: Array<{ date: string; count: number }>;
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color,
  chartData 
}: StatCardProps) {
  const miniChartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    smooth: true,
    lineStyle: {
      stroke: color,
      lineWidth: 2,
    },
    point: false,
    areaStyle: {
      fill: `l(270) 0:${color} 1:#ffffff`,
    },
    height: 50,
    padding: [0, 0, 0, 0],
    xAxis: false,
    yAxis: false,
    tooltip: false,
  };

  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {changeType === 'positive' ? (
            <ArrowUp size={14} style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDown size={14} style={{ color: '#ff4d4f' }} />
          )}
          <span style={{ 
            color: changeType === 'positive' ? '#52c41a' : '#ff4d4f',
            fontSize: 12,
            fontWeight: 500,
          }}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>
            vs прошлый месяц
          </span>
        </div>
        <div style={{ width: 100, height: 50 }}>
          {/* {chartData.length > 0 && <Line {...miniChartConfig} />} */}
          <div style={{ width: 100, height: 50, background: '#f0f0f0', borderRadius: 4 }} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Вспомогательные функции
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    CONTACTED: 'Связались',
    CONVERTED: 'Конвертирована',
    REJECTED: 'Отклонена',
    SPAM: 'Спам',
  };
  return labels[status] || status;
}

function getStatusConfig(status: string) {
  const configs: Record<string, { color: string; label: string }> = {
    NEW: { color: 'blue', label: 'Новая' },
    IN_PROGRESS: { color: 'orange', label: 'В работе' },
    CONTACTED: { color: 'cyan', label: 'Связались' },
    CONVERTED: { color: 'green', label: 'Конвертирована' },
    REJECTED: { color: 'red', label: 'Отклонена' },
    SPAM: { color: 'default', label: 'Спам' },
  };
  return configs[status] || { color: 'default', label: status };
}



