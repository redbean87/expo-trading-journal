import { usePathname } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { DesktopSidebar } from './desktop-sidebar';
import { useNavigationMode } from '../hooks/use-navigation-mode';

type SidebarLayoutProps = {
  children: ReactNode;
};

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const mode = useNavigationMode();
  const pathname = usePathname();
  const isSidebar = mode === 'sidebar';

  // Exclude auth routes from showing sidebar
  const isExcluded = pathname.startsWith('/auth/');

  if (isSidebar && !isExcluded) {
    return (
      <View style={styles.container}>
        <DesktopSidebar />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
