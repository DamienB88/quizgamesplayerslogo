/**
 * Animated Welcome Screen
 * First screen with animated logo and app introduction
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    logoRotate.value = withSequence(
      withTiming(360, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 0 })
    );

    // Animate title
    titleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600 })
    );
    titleTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 12 })
    );

    // Animate subtitle
    subtitleOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 600 })
    );

    // Auto-navigate to carousel after animations
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/carousel');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🔒</Text>
        </View>
      </Animated.View>

      {/* Animated Title */}
      <Animated.View style={titleAnimatedStyle}>
        <Text style={styles.title}>Privacy Social</Text>
      </Animated.View>

      {/* Animated Subtitle */}
      <Animated.View style={subtitleAnimatedStyle}>
        <Text style={styles.subtitle}>Share moments, protect privacy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
});
