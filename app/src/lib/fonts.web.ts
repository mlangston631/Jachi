/** The web preview (used for screenshots) loads the same font files the phone apps have built in. */
import * as Font from 'expo-font';

export async function loadFonts(): Promise<void> {
  await Font.loadAsync({
    'Fraunces-Display': require('../../assets/fonts/Fraunces-Display.ttf'),
    'Fraunces-DisplayItalic': require('../../assets/fonts/Fraunces-DisplayItalic.ttf'),
    'Fraunces-Heading': require('../../assets/fonts/Fraunces-Heading.ttf'),
    'InstrumentSans-Regular': require('../../assets/fonts/InstrumentSans-Regular.ttf'),
    'InstrumentSans-Medium': require('../../assets/fonts/InstrumentSans-Medium.ttf'),
    'InstrumentSans-SemiBold': require('../../assets/fonts/InstrumentSans-SemiBold.ttf'),
  }).catch(() => {});
}
