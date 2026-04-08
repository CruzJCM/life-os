// ===========================================
// Card Types
// ===========================================

export type CardType = 'event_counter' | 'goal_counter' | 'daily_checklist' | 'goal_progress';

export type CardStatus = 'active' | 'completed' | 'archived';

// ===========================================
// Card Configurations (stored in JSONB)
// ===========================================

export interface EventCounterConfig {
  target_date: string;
  event_name: string;
}

export interface GoalCounterConfig {
  period: 'week' | 'month';
  current_count: number;
  target_count?: number;
  period_start: string; // ISO date string
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyChecklistConfig {
  items: ChecklistItem[];
}

export interface GoalProgressConfig {
  current: number;
  target: number;
  unit: string;
}

export type CardConfig =
  | EventCounterConfig
  | GoalCounterConfig
  | DailyChecklistConfig
  | GoalProgressConfig;

// ===========================================
// Card Entity
// ===========================================

export interface Card {
  id: string;
  user_id: string;
  type: CardType;
  status: CardStatus;
  title: string;
  description?: string;
  color: string;
  icon?: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: CardConfig;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// ===========================================
// Card History
// ===========================================

export interface CardHistory {
  id: string;
  card_id: string;
  user_id: string;
  card_type: CardType;
  title: string;
  final_config: CardConfig;
  started_at: string;
  completed_at: string;
  duration_days: number;
  stats: Record<string, unknown>;
  created_at: string;
}

// ===========================================
// Grid Layout Types
// ===========================================

export interface GridLayout {
  i: string; // card id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface GridLayouts {
  lg: GridLayout[];
  md: GridLayout[];
  sm: GridLayout[];
  xs: GridLayout[];
  xxs: GridLayout[];
}

// ===========================================
// Create/Update Card DTOs
// ===========================================

export interface CreateCardDTO {
  type: CardType;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  config: CardConfig;
  width?: number;
  height?: number;
}

export interface UpdateCardDTO {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  config?: CardConfig;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  status?: CardStatus;
}