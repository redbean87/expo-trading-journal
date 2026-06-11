'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.useTimezoneStore = exports.TIMEZONE_OPTIONS = void 0;
const async_storage_1 = __importDefault(
  require('@react-native-async-storage/async-storage')
);
const zustand_1 = require('zustand');
exports.TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'UTC', label: 'UTC' },
];
const TIMEZONE_STORAGE_KEY = '@timezone';
function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
}
exports.useTimezoneStore = (0, zustand_1.create)((set) => ({
  timezone: getDeviceTimezone(),
  isLoading: true,
  loadTimezone: async () => {
    try {
      const stored =
        await async_storage_1.default.getItem(TIMEZONE_STORAGE_KEY);
      if (stored) {
        set({ timezone: stored, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading timezone:', error);
      set({ isLoading: false });
    }
  },
  setTimezone: async (tz) => {
    set({ timezone: tz });
    try {
      await async_storage_1.default.setItem(TIMEZONE_STORAGE_KEY, tz);
    } catch (error) {
      console.error('Error saving timezone:', error);
    }
  },
  setFromCloud: (tz) => {
    set({ timezone: tz });
  },
}));
