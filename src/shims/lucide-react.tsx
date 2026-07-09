import React from 'react'

export type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>

const Placeholder: LucideIcon = (props) => (
  <svg
    width={props.width ?? 18}
    height={props.height ?? 18}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

// Export a set of placeholder icons used across the app
export const ArrowRight: LucideIcon = Placeholder
export const Quote: LucideIcon = Placeholder
export const AlertCircle: LucideIcon = Placeholder
export const CheckCircle: LucideIcon = Placeholder
export const Loader2: LucideIcon = Placeholder
export const Building2: LucideIcon = Placeholder
export const Home: LucideIcon = Placeholder
export const LayoutGrid: LucideIcon = Placeholder
export const PenTool: LucideIcon = Placeholder
export const Ruler: LucideIcon = Placeholder
export const Trees: LucideIcon = Placeholder
export const Mail: LucideIcon = Placeholder
export const MapPin: LucideIcon = Placeholder
export const Phone: LucideIcon = Placeholder
export const ArrowLeft: LucideIcon = Placeholder
export const Calendar: LucideIcon = Placeholder

// Make a generic default export for completeness
const _default = {
  ArrowRight,
  Quote,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2,
  Home,
  LayoutGrid,
  PenTool,
  Ruler,
  Trees,
  Mail,
  MapPin,
  Phone,
  ArrowLeft,
  Calendar,
}

export default _default
