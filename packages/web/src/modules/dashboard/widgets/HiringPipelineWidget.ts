import { gql, useQuery } from '@apollo/client';

import type { WidgetData, WidgetFieldDefinition } from './types';

const HIRING_PIPELINE_QUERY = gql`
  query DashboardHiringPipeline {
    hiringRequests {
      id
      status
    }
  }
`;

type HiringPipelineData = {
  hiringRequests: ReadonlyArray<{ id: string; status: string }>;
};

const CLOSED_STATUSES = new Set(['filled', 'cancelled']);

export const HIRING_PIPELINE_FIELDS: readonly WidgetFieldDefinition[] = [
  { id: 'total', label: 'Requests' },
  { id: 'active', label: 'Active' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'inReview', label: 'In review' },
  { id: 'sourcing', label: 'Sourcing' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'filled', label: 'Filled' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const useHiringPipelineData = (): WidgetData => {
  const { data, loading, error } = useQuery<HiringPipelineData>(HIRING_PIPELINE_QUERY);
  const requests = data?.hiringRequests ?? [];
  const countWhere = (status: string): number =>
    requests.filter((request) => request.status === status).length;

  return {
    loading,
    error: Boolean(error),
    values: {
      total: requests.length,
      active: requests.filter((request) => !CLOSED_STATUSES.has(request.status)).length,
      submitted: countWhere('submitted'),
      inReview: countWhere('inReview'),
      sourcing: countWhere('sourcing'),
      interviewing: countWhere('interviewing'),
      offer: countWhere('offer'),
      filled: countWhere('filled'),
      cancelled: countWhere('cancelled'),
    },
    breakdown: [
      { id: 'submitted', label: 'Submitted', value: countWhere('submitted') },
      { id: 'inReview', label: 'In review', value: countWhere('inReview') },
      { id: 'sourcing', label: 'Sourcing', value: countWhere('sourcing') },
      { id: 'interviewing', label: 'Interviewing', value: countWhere('interviewing') },
      { id: 'offer', label: 'Offer', value: countWhere('offer') },
      { id: 'filled', label: 'Filled', value: countWhere('filled') },
    ],
  };
};
