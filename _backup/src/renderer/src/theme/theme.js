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
    borderRadius: 8
  },
  components: {
    Button: {
      colorPrimary: '#fff',
      colorBgContainer: '#111',
      colorText: '#fff',
      colorBorder: '#fff'
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
    borderRadius: 8
  },
  components: {
    Button: {
      colorPrimary: '#000',
      colorBgContainer: '#fff',
      colorText: '#000',
      colorBorder: '#000'
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
