import AsyncStorage from '@react-native-async-storage/async-storage';

import { useProfileStore } from '../profile-store';

describe('useProfileStore', () => {
  beforeEach(async () => {
    // Reset store state between tests
    useProfileStore.setState({ displayName: null, isLoading: false });
    await AsyncStorage.clear();
  });

  describe('setDisplayName', () => {
    it('should set display name in store', async () => {
      await useProfileStore.getState().setDisplayName('My Trading Journal');

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe('My Trading Journal');
    });

    it('should persist display name to AsyncStorage', async () => {
      await useProfileStore.getState().setDisplayName('My Trading Journal');

      const stored = await AsyncStorage.getItem('@user_profile');
      expect(stored).toBeTruthy();
      const profile = JSON.parse(stored!);
      expect(profile.displayName).toBe('My Trading Journal');
    });

    it('should trim whitespace from display name', async () => {
      await useProfileStore.getState().setDisplayName('  My Journal  ');

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe('My Journal');
    });

    it('should convert empty string to null', async () => {
      await useProfileStore.getState().setDisplayName('');

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBeNull();
    });

    it('should convert whitespace-only string to null', async () => {
      await useProfileStore.getState().setDisplayName('   ');

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBeNull();
    });

    it('should handle null value', async () => {
      await useProfileStore.getState().setDisplayName('Test');
      await useProfileStore.getState().setDisplayName(null);

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBeNull();
    });

    it('should persist null to AsyncStorage', async () => {
      await useProfileStore.getState().setDisplayName('Test');
      await useProfileStore.getState().setDisplayName(null);

      const stored = await AsyncStorage.getItem('@user_profile');
      expect(stored).toBeTruthy();
      const profile = JSON.parse(stored!);
      expect(profile.displayName).toBeNull();
    });
  });

  describe('loadProfile', () => {
    it('should load display name from AsyncStorage', async () => {
      await AsyncStorage.setItem(
        '@user_profile',
        JSON.stringify({ displayName: 'My Journal' })
      );

      await useProfileStore.getState().loadProfile();

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe('My Journal');
    });

    it('should set isLoading to false after loading', async () => {
      await useProfileStore.getState().loadProfile();

      const { isLoading } = useProfileStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should handle empty storage', async () => {
      await useProfileStore.getState().loadProfile();

      const { displayName, isLoading } = useProfileStore.getState();
      expect(displayName).toBeNull();
      expect(isLoading).toBe(false);
    });

    it('should handle null displayName in storage', async () => {
      await AsyncStorage.setItem(
        '@user_profile',
        JSON.stringify({ displayName: null })
      );

      await useProfileStore.getState().loadProfile();

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      await AsyncStorage.setItem('@user_profile', 'invalid json');

      await useProfileStore.getState().loadProfile();

      const { displayName, isLoading } = useProfileStore.getState();
      expect(displayName).toBeNull();
      expect(isLoading).toBe(false);
    });
  });

  describe('setFromCloud', () => {
    it('should update state without persisting to AsyncStorage', async () => {
      useProfileStore.getState().setFromCloud('Cloud Journal');

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe('Cloud Journal');

      // Should NOT persist to AsyncStorage
      const stored = await AsyncStorage.getItem('@user_profile');
      expect(stored).toBeNull();
    });

    it('should handle null value', () => {
      useProfileStore.setState({ displayName: 'Test' });
      useProfileStore.getState().setFromCloud(null);

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle 50 character display name', async () => {
      const longName = 'A'.repeat(50);
      await useProfileStore.getState().setDisplayName(longName);

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe(longName);
      expect(displayName!.length).toBe(50);
    });

    it('should handle special characters', async () => {
      const specialName = "John's Trading Journal! 📈";
      await useProfileStore.getState().setDisplayName(specialName);

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe(specialName);
    });

    it('should handle unicode characters', async () => {
      const unicodeName = '我的交易日記';
      await useProfileStore.getState().setDisplayName(unicodeName);

      const { displayName } = useProfileStore.getState();
      expect(displayName).toBe(unicodeName);
    });
  });
});
