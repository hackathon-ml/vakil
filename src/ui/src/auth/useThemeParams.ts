import { themeParams, useSignal } from '@telegram-apps/sdk-react';

/** Theme tokens from Telegram. Prefer CSS vars; use this when inline styles are required. */
export function useThemeParams() {
  return {
    bgColor: useSignal(themeParams.backgroundColor),
    textColor: useSignal(themeParams.textColor),
    hintColor: useSignal(themeParams.hintColor),
    buttonColor: useSignal(themeParams.buttonColor),
    buttonTextColor: useSignal(themeParams.buttonTextColor),
    linkColor: useSignal(themeParams.linkColor),
    secondaryBgColor: useSignal(themeParams.secondaryBackgroundColor),
    destructiveTextColor: useSignal(themeParams.destructiveTextColor),
    sectionBgColor: useSignal(themeParams.sectionBackgroundColor),
    sectionSeparatorColor: useSignal(themeParams.sectionSeparatorColor),
    accentTextColor: useSignal(themeParams.accentTextColor),
    isDark: useSignal(themeParams.isDark),
  };
}
