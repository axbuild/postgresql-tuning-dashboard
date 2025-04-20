import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { StyledPaper } from './StyledComponents';

interface Metric {
  name: string;
  description: string;
  calculation: string;
  normalRanges: {
    optimal: string;
    warning: string;
  };
  examples: {
    good: string;
    bad: string;
  };
  troubleshooting: string[];
}

interface Correlation {
  relationship: string;
  whatItMeans: string;
}

interface ChartProps {
  title: string;
  xAxis: {
    title: string;
    tooltip: string;
  };
  yAxis: {
    title: string;
    tooltip: string;
  };
  data?: any[];
  description?: string;
  metrics?: Metric[];
  correlations?: Correlation[];
}

export const Chart: React.FC<ChartProps> = ({
  title,
  xAxis,
  yAxis,
  data = [],
  description,
  metrics = [],
  correlations = [],
}) => {
  return (
    <Box>
      {/* График */}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{
              value: xAxis.title,
              position: 'insideBottom',
              offset: -10,
            }}
          />
          <YAxis
            label={{
              value: yAxis.title,
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Описание и метрики */}
      <StyledPaper sx={{ mt: 2 }}>
        {description && (
          <>
            <Typography variant="h6" gutterBottom>
              Описание графика
            </Typography>
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
          </>
        )}

        {metrics.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Метрики
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {metrics.map((metric, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {metric.name}
                      </Typography>
                      <Chip
                        size="small"
                        label="Метрика"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {metric.description}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom>
                      Расчет: {metric.calculation}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Нормальные значения:
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 'small' }} />
                        <Typography variant="body2">
                          Оптимально: {metric.normalRanges.optimal}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon color="warning" sx={{ mr: 1, fontSize: 'small' }} />
                        <Typography variant="body2">
                          Внимание: {metric.normalRanges.warning}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Примеры:
                    </Typography>
                    <Alert severity="success" sx={{ mb: 1 }} icon={false}>
                      <Typography variant="body2">{metric.examples.good}</Typography>
                    </Alert>
                    <Alert severity="error" sx={{ mb: 1 }} icon={false}>
                      <Typography variant="body2">{metric.examples.bad}</Typography>
                    </Alert>

                    <Typography variant="subtitle2" gutterBottom>
                      Решение проблем:
                    </Typography>
                    <List dense>
                      {metric.troubleshooting.map((tip, tipIndex) => (
                        <ListItem key={tipIndex} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon color="action" sx={{ fontSize: 'small' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={tip}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}

        {correlations.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Взаимосвязи метрик
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {correlations.map((correlation, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {correlation.relationship}
                      </Typography>
                      <Chip
                        size="small"
                        label="Корреляция"
                        color="info"
                        icon={<TrendingUpIcon />}
                      />
                    </Box>
                    <Typography variant="body2">
                      {correlation.whatItMeans}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </StyledPaper>
    </Box>
  );
}; 