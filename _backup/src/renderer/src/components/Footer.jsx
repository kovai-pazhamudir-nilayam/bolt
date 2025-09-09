const Footer = () => {
  return (
    <footer>
      Electron v{window.electron?.process?.versions?.electron || 'N/A'} | Chromium v
      {window.electron?.process?.versions?.chrome || 'N/A'} | Node v
      {window.electron?.process?.versions?.node || 'N/A'}
    </footer>
  )
}

export default Footer
