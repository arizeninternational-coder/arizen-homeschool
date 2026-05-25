/**
 * Arizen School — Design System
 * 
 * Usage in components:
 *   import { ds } from '@/lib/design-system'
 *   
 *   <div style={ds.card}>...</div>
 *   <button style={ds.btnPrimary}>...</button>
 *   <h1 style={ds.headingHero}>...</h1>
 */

export const colors = {
  bg: 'rgb(var(--color-bg))',
  bgSoft: 'rgb(var(--color-bg-soft))',
  bgWarm: 'rgb(var(--color-bg-warm))',
  primary: 'rgb(var(--color-primary))',
  primaryLight: 'rgb(var(--color-primary-light))',
  primarySoft: 'rgb(var(--color-primary-soft))',
  primaryDark: 'rgb(var(--color-primary-dark))',
  accent: 'rgb(var(--color-accent))',
  accentSoft: 'rgb(var(--color-accent-soft))',
  warm: 'rgb(var(--color-warm))',
  warmSoft: 'rgb(var(--color-warm-soft))',
  text: 'rgb(var(--color-text))',
  textHeading: 'rgb(var(--color-text-heading))',
  textMuted: 'rgb(var(--color-text-muted))',
  textInverse: 'rgb(var(--color-text-inverse))',
  border: 'rgb(var(--color-border))',
  borderLight: 'rgb(var(--color-border-light))',
  success: 'rgb(var(--color-success))',
  danger: 'rgb(var(--color-danger))',
  warning: 'rgb(var(--color-warning))',
} as const;

export const ds = {
  // ── Layout ──
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  containerNarrow: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  containerBase: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.25rem',
  },

  // ── Cards ──
  card: {
    background: 'white',
    borderRadius: '1.5rem',
    border: `1px solid ${colors.borderLight}`,
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.03)',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  },
  cardInteractive: {
    background: 'white',
    borderRadius: '1.5rem',
    border: `1px solid ${colors.borderLight}`,
    padding: '1.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease',
    cursor: 'pointer' as const,
  },
  cardFlat: {
    background: 'white',
    borderRadius: '1.5rem',
    border: `1px solid ${colors.borderLight}`,
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },

  // ── Buttons ──
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '1rem',
    padding: '0.8rem 1.75rem',
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: 'white',
    background: colors.primary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(20,184,166,0.25)',
  } as React.CSSProperties,
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '1rem',
    padding: '0.8rem 1.75rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.primaryDark,
    background: colors.primarySoft,
    border: `1px solid ${colors.primaryLight}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    borderRadius: '0.75rem',
    padding: '0.55rem 1.1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.textMuted,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  // ── Form ──
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.9375rem',
    color: colors.text,
    background: 'white',
    border: `1.5px solid ${colors.border}`,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '0.4rem',
    color: colors.text,
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  // ── Typography ──
  headingHero: {
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    color: colors.textHeading,
  } as React.CSSProperties,
  headingLg: {
    fontSize: '1.625rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: colors.textHeading,
    lineHeight: 1.2,
  } as React.CSSProperties,
  headingMd: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.textHeading,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
  headingSm: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: colors.textHeading,
  } as React.CSSProperties,
  textBody: {
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    color: colors.textMuted,
  } as React.CSSProperties,
  textBodyLg: {
    fontSize: '1.0625rem',
    lineHeight: 1.7,
    color: colors.textMuted,
  } as React.CSSProperties,
  textTagline: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: colors.primary,
  } as React.CSSProperties,

  // ── Alerts ──
  alertError: {
    display: 'flex',
    alignItems: 'flex-start' as const,
    gap: '0.65rem',
    background: 'rgba(248,113,113,0.07)',
    border: '1px solid rgba(248,113,113,0.15)',
    borderRadius: '1rem',
    padding: '0.85rem 1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,

  // ── Logo ──
  logoMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1rem',
    background: colors.primary,
    color: 'white',
    boxShadow: '0 2px 10px rgba(20,184,166,0.25)',
  } as React.CSSProperties,

  // ── Gradient Text ──
  textGradient: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as React.CSSProperties,

  // ── Navbar ──
  nav: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${colors.borderLight}`,
  } as React.CSSProperties,

  // ── Section ──
  section: {
    padding: '5rem 0',
  } as React.CSSProperties,
} as const;
