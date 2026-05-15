import { Paper } from '@mantine/core';

export function GlassCard({ children, className = '', ...props }) {
  return (
    <Paper className={`glass-card ${className}`} {...props}>
      {children}
    </Paper>
  );
}
