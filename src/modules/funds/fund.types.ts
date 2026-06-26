export interface Fund {
  id: string
  name: string
  vintage_year: number
  target_size_usd: number
  status: 'Fundraising' | 'Investing' | 'Closed'
  created_at: Date
}
