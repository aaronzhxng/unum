import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";

const ICON = require("../../assets/app_icons/game-icons_olive.png");

// ─── 1. FADE ────────────────────────────────────────────────────────────────
export const FadeSpinner = ({ size = 48 }: { size?: number }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Animated.Image
        source={ICON}
        style={{ width: size, height: size, opacity }}
        resizeMode="contain"
      />
    </View>
  );
};

// ─── 2. ORBIT DOT ───────────────────────────────────────────────────────────
export const OrbitDotSpinner = ({
  size = 48,
  orbitRadius = 32,
}: {
  size?: number;
  orbitRadius?: number;
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const containerSize = size + orbitRadius * 2;

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Static icon in center */}
      <Image
        source={ICON}
        style={{ width: size, height: size, position: "absolute" }}
        resizeMode="contain"
      />
      {/* Rotating arm with dot at tip */}
      <Animated.View
        style={{
          position: "absolute",
          width: containerSize,
          height: containerSize,
          justifyContent: "flex-start",
          alignItems: "center",
          transform: [{ rotate }],
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#008CFF",
            marginTop: 0,
          }}
        />
      </Animated.View>
    </View>
  );
};

// ─── 3. DOTS ────────────────────────────────────────────────────────────────
const AnimatedDot = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(600 - delay),
        ]),
      ).start();
    animate();
  }, []);

  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#008CFF",
        marginHorizontal: 3,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

export const DotsSpinner = ({ size = 48 }: { size?: number }) => (
  <View style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
    <Image
      source={ICON}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <AnimatedDot delay={0} />
      <AnimatedDot delay={200} />
      <AnimatedDot delay={400} />
    </View>
  </View>
);

// ─── 4. RING ────────────────────────────────────────────────────────────────
export const RingSpinner = ({ size = 48 }: { size?: number }) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Image
        source={ICON}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: "#008CFF",
          transform: [{ scale }],
          opacity,
        }}
      />
    </View>
  );
};

// ─── DEFAULT EXPORT (change this to swap which one is used app-wide) ─────────
export default OrbitDotSpinner;
