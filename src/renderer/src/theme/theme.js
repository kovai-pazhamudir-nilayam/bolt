import { theme } from 'antd'

// ─────────────────────────────────────────────────────────
// Brand — change these to retheme the whole app
// ─────────────────────────────────────────────────────────
export const BRAND = {
  accent: '#f67373',          // menu active, links, focus rings, badges
  accentHover: '#f85555',
  accentBgDark: 'rgba(246, 115, 115, 0.12)',
  accentBgLight: 'rgba(246, 115, 115, 0.08)'
}

// ─────────────────────────────────────────────────────────
// Dark palette
// ─────────────────────────────────────────────────────────
const D = {
  base: '#111111',
  container: '#1a1a1a',   // cards, inputs, table body
  elevated: '#252525',    // dropdowns, popups, modals, tooltips
  elevated2: '#2e2e2e',   // table header, card header
  border: '#2e2e2e',
  borderSecondary: '#222222',
  text: '#e8e8e8',
  textSecondary: '#888888',
  textDisabled: '#555555',
  btnPrimaryBg: '#ffffff', // dark mode: white primary buttons
  btnPrimaryText: '#000000'
}

// ─────────────────────────────────────────────────────────
// Light palette
// ─────────────────────────────────────────────────────────
const L = {
  base: '#ffffff',
  container: '#ffffff',
  elevated: '#ffffff',
  elevated2: '#fafafa',
  border: '#e0e0e0',
  borderSecondary: '#f0f0f0',
  text: '#141414',
  textSecondary: '#666666',
  textDisabled: '#aaaaaa',
  btnPrimaryBg: '#000000', // light mode: black primary buttons
  btnPrimaryText: '#ffffff'
}

// ─────────────────────────────────────────────────────────
// Shared component tokens factory
// ─────────────────────────────────────────────────────────
const components = (p) => ({
  Button: {
    colorPrimary: p.btnPrimaryBg,
    colorPrimaryHover: p === D ? '#e0e0e0' : '#333333',
    colorPrimaryActive: p.btnPrimaryBg,
    colorPrimaryText: p.btnPrimaryText,
    colorPrimaryTextHover: p.btnPrimaryText,
    colorPrimaryTextActive: p.btnPrimaryText,
    colorBgContainer: p.container,
    colorText: p.text,
    colorBorder: p.border,
    colorTextDisabled: p.textDisabled,
    colorBgContainerDisabled: p.base,
    colorBorderDisabled: p.borderSecondary
  },
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
    itemColor: p.textSecondary,
    itemHoverColor: BRAND.accent,
    itemHoverBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    itemSelectedColor: BRAND.accent,
    itemSelectedBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    itemActiveBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    itemActiveColor: BRAND.accent
  },
  Layout: {
    headerBg: '#000000',
    siderBg: p.base,
    bodyBg: p === D ? '#141414' : '#f5f5f5',
    triggerBg: p === D ? '#0a0a0a' : '#e0e0e0',
    triggerColor: p.text
  },
  Input: {
    colorBgContainer: p.container,
    colorBorder: p.border,
    colorText: p.text,
    colorTextPlaceholder: p.textSecondary,
    colorBgContainerDisabled: p.base,
    activeBorderColor: BRAND.accent,
    hoverBorderColor: BRAND.accent
  },
  Select: {
    colorBgContainer: p.container,
    colorBorder: p.border,
    colorText: p.text,
    colorTextPlaceholder: p.textSecondary,
    optionSelectedBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    optionSelectedColor: BRAND.accent,
    optionActiveBg: p.elevated2
  },
  Table: {
    colorBgContainer: p.container,
    headerBg: p.elevated2,
    headerColor: p.text,
    borderColor: p.border,
    rowHoverBg: p.elevated2,
    colorText: p.text
  },
  Card: {
    colorBgContainer: p.container,
    colorBorderSecondary: p.border,
    colorText: p.text,
    colorTextHeading: p.text,
    headerBg: p.elevated2
  },
  Modal: {
    contentBg: p.elevated,
    headerBg: p.elevated2,
    colorText: p.text,
    colorTextHeading: p.text,
    colorIcon: p.textSecondary,
    colorIconHover: p.text,
    footerBg: p.elevated2
  },
  Drawer: {
    colorBgElevated: p.elevated,
    colorText: p.text
  },
  Dropdown: {
    colorBgElevated: p.elevated,
    colorText: p.text,
    controlItemBgHover: p.elevated2,
    controlItemBgActive: p === D ? BRAND.accentBgDark : BRAND.accentBgLight
  },
  Popover: {
    colorBgElevated: p.elevated,
    colorText: p.text
  },
  Tooltip: {
    colorBgSpotlight: p === D ? '#3a3a3a' : '#1a1a1a',
    colorTextLightSolid: '#ffffff'
  },
  Tag: {
    colorBgContainer: p.elevated2,
    colorBorder: p.border,
    colorText: p.text
  },
  Tabs: {
    colorBorderSecondary: p.border,
    itemColor: p.textSecondary,
    itemHoverColor: BRAND.accent,
    itemSelectedColor: BRAND.accent,
    inkBarColor: BRAND.accent,
    cardBg: p.elevated2
  },
  Alert: {
    colorText: p.text
  },
  Notification: {
    colorBgElevated: p.elevated,
    colorText: p.text
  },
  Message: {
    contentBg: p.elevated,
    colorText: p.text
  },
  Pagination: {
    itemActiveBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    colorPrimary: BRAND.accent,
    colorPrimaryHover: BRAND.accentHover
  },
  Switch: {
    colorPrimary: BRAND.accent,
    colorPrimaryHover: BRAND.accentHover
  },
  Checkbox: {
    colorPrimary: BRAND.accent,
    colorPrimaryHover: BRAND.accentHover
  },
  Radio: {
    colorPrimary: BRAND.accent,
    colorPrimaryHover: BRAND.accentHover
  },
  Spin: {
    colorPrimary: BRAND.accent
  },
  Progress: {
    defaultColor: BRAND.accent
  },
  Form: {
    labelColor: p.text,
    colorText: p.text
  },
  Typography: {
    colorText: p.text,
    colorTextSecondary: p.textSecondary,
    colorTextHeading: p.text
  },
  Segmented: {
    itemColor: p.textSecondary,
    itemSelectedColor: BRAND.accent,
    itemSelectedBg: p === D ? BRAND.accentBgDark : BRAND.accentBgLight,
    itemHoverColor: BRAND.accent,
    trackBg: p.elevated2
  },
  Popconfirm: {
    colorText: p.text
  }
})

// ─────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────
const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: BRAND.accent,
    colorLink: BRAND.accent,
    colorLinkHover: BRAND.accentHover,
    colorBgBase: D.base,
    colorTextBase: D.text,
    colorText: D.text,
    colorBgContainer: D.container,
    colorBgElevated: D.elevated,
    colorBgSpotlight: D.elevated,
    colorBorder: D.border,
    colorBorderSecondary: D.borderSecondary,
    colorTextSecondary: D.textSecondary,
    colorTextDisabled: D.textDisabled,
    borderRadius: 8,
    zIndexPopupBase: 9999
  },
  components: components(D)
}

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: BRAND.accent,
    colorLink: BRAND.accent,
    colorLinkHover: BRAND.accentHover,
    colorBgBase: L.base,
    colorTextBase: L.text,
    colorText: L.text,
    colorBgContainer: L.container,
    colorBgElevated: L.elevated,
    colorBgSpotlight: L.elevated,
    colorBorder: L.border,
    colorBorderSecondary: L.borderSecondary,
    colorTextSecondary: L.textSecondary,
    colorTextDisabled: L.textDisabled,
    borderRadius: 8,
    zIndexPopupBase: 9999
  },
  components: components(L)
}

export { lightTheme, darkTheme }
