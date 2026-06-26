export interface Investor {
  id: string
  name: string
  email: string
  investor_type: 'Individual' | 'Institution' | 'FamilyOffice'
  created_at: Date
}
