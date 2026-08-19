export type ContactReason =
  | 'general'
  | 'custom-order'
  | 'catering-event'
  | 'cafe'
  | 'wholesale-collaboration';

export interface ContactReasonOption {
  value: ContactReason;
  label: string;
}

export const CONTACT_REASONS: ContactReasonOption[] = [
  { value: 'general', label: 'General Question' },
  { value: 'custom-order', label: 'Custom Order' },
  { value: 'catering-event', label: 'Catering / Event' },
  { value: 'cafe', label: 'Café' },
  { value: 'wholesale-collaboration', label: 'Wholesale / Collaboration' }
];

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  reason: ContactReason;
  message: string;
}
