import { theme } from 'antd'

// Black & white AntD theme tokens
const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#fff',
    colorBgBase: '#111',
    colorTextBase: '#fff',
    colorText: '#fff',
    colorBgContainer: '#181818',
    colorBorder: '#333',
    borderRadius: 8,
    zIndexPopupBase: 9999
  },
  components: {
    Button: {
      colorPrimary: '#ffffff',
      colorBgContainer: '#1f1f1f',
      colorText: '#ffffff',
      colorBorder: '#ffffff',
      colorPrimaryHover: '#f0f0f0',
      colorPrimaryActive: '#ffffff',
      colorTextDisabled: '#666666',
      colorBgContainerDisabled: '#1a1a1a',
      colorBorderDisabled: '#333333',
      colorPrimaryText: '#000000',
      colorPrimaryTextHover: '#000000',
      colorPrimaryTextActive: '#000000'
    },
    Layout: {
      headerBg: '#111',
      siderBg: '#181818',
      baseBg: '#111'
    },
    Menu: {
      itemBg: '#181818',
      itemColor: '#fff',
      itemHoverColor: '#f67373',
      itemSelectedBg: '#fff',
      itemSelectedColor: '#f67373',
      itemActiveBg: '#fff',
      itemActiveColor: '#f67373'
    }
  }
}
const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#000',
    colorBgBase: '#fff',
    colorTextBase: '#000',
    colorText: '#000',
    colorBgContainer: '#f8f8f8',
    colorBorder: '#ccc',
    borderRadius: 8,
    zIndexPopupBase: 9999
  },
  components: {
    Button: {
      colorPrimary: '#000000',
      colorBgContainer: '#ffffff',
      colorText: '#000000',
      colorBorder: '#000000',
      colorPrimaryHover: '#000000',
      colorPrimaryActive: '#000000',
      colorTextDisabled: '#999999',
      colorBgContainerDisabled: '#f5f5f5',
      colorBorderDisabled: '#d9d9d9'
    },
    Layout: {
      headerBg: '#fff',
      siderBg: '#f8f8f8',
      baseBg: '#fff'
    },
    Menu: {
      itemBg: '#f8f8f8',
      itemColor: '#000',
      itemHoverColor: '#f67373',
      itemSelectedBg: '#fff',
      itemSelectedColor: '#f67373',
      itemActiveBg: '#fff',
      itemActiveColor: '#f67373'
    }
  }
}

export { lightTheme, darkTheme }
