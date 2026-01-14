import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const g = global as unknown as {
    window?: {
      addEventListener?: () => void;
      removeEventListener?: () => void;
    };
  };

  if (typeof g.window !== 'undefined') {
    if (!g.window.addEventListener) {
      g.window.addEventListener = () => {};
    }
    if (!g.window.removeEventListener) {
      g.window.removeEventListener = () => {};
    }
  } else {
    g.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
}
