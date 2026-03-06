import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

const PIP_WIDTH = 120;  // Matches the more square card in the reference
const PIP_HEIGHT = 120;
const SAFE_MARGIN = 12;
const TOP_BOUND = 80;

interface VoicePIPOverlayProps {
    visible: boolean;
    onPress: () => void;
    avatarUrl?: string;
    username?: string;
    isMicMuted?: boolean;
    isCameraOff?: boolean;
}

export const VoicePIPOverlay: React.FC<VoicePIPOverlayProps> = ({
    visible,
    onPress,
    avatarUrl,
    username = 'User',
    isMicMuted = true,
    isCameraOff = true,
}) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const BOTTOM_BOUND = SCREEN_HEIGHT - 120; // Above navigation bar

    // Initials Fallback
    const initials = useMemo(() => {
        if (!username || typeof username !== 'string') return 'U';
        const parts = username.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return username.substring(0, 2).toUpperCase();
    }, [username]);

    const pan = useRef(new Animated.ValueXY({ x: -1000, y: -1000 })).current;
    const isInitialized = useRef(false);

    // Dynamic Initialization to safe corner
    useEffect(() => {
        if (!isInitialized.current && SCREEN_WIDTH > 0 && SCREEN_HEIGHT > 0) {
            pan.setValue({
                x: SCREEN_WIDTH - PIP_WIDTH - SAFE_MARGIN,
                y: BOTTOM_BOUND - PIP_HEIGHT - SAFE_MARGIN
            });
            isInitialized.current = true;
        }
    }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
            },
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (_, gestureState) => {
                // ABSOLUTE CLAMPING
                const rawX = (pan.x as any)._offset + gestureState.dx;
                const rawY = (pan.y as any)._offset + gestureState.dy;

                let restrictedDX = gestureState.dx;
                let restrictedDY = gestureState.dy;

                // Clamp X
                if (rawX < SAFE_MARGIN) {
                    restrictedDX = SAFE_MARGIN - (pan.x as any)._offset;
                } else if (rawX > SCREEN_WIDTH - PIP_WIDTH - SAFE_MARGIN) {
                    restrictedDX = (SCREEN_WIDTH - PIP_WIDTH - SAFE_MARGIN) - (pan.x as any)._offset;
                }

                // Clamp Y
                if (rawY < TOP_BOUND) {
                    restrictedDY = TOP_BOUND - (pan.y as any)._offset;
                } else if (rawY > BOTTOM_BOUND - PIP_HEIGHT) {
                    restrictedDY = (BOTTOM_BOUND - PIP_HEIGHT) - (pan.y as any)._offset;
                }

                pan.setValue({ x: restrictedDX, y: restrictedDY });
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();

                const currentX = (pan.x as any)._value;
                const finalX = currentX > (SCREEN_WIDTH - PIP_WIDTH) / 2
                    ? SCREEN_WIDTH - PIP_WIDTH - SAFE_MARGIN
                    : SAFE_MARGIN;

                let finalY = (pan.y as any)._value;
                finalY = Math.max(TOP_BOUND, Math.min(finalY, BOTTOM_BOUND - PIP_HEIGHT));

                Animated.spring(pan, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                    damping: 25,
                    stiffness: 200,
                }).start();
            },
        })
    ).current;

    if (!visible) return null;

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.container,
                {
                    width: PIP_WIDTH,
                    height: PIP_HEIGHT,
                    transform: pan.getTranslateTransform(),
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={styles.card}
            >
                {/* Visual Content (Mirroring Main Card) */}
                <View style={styles.content}>
                    {/* Snake Ornament Frame */}
                    <Image
                        source={{ uri: 'https://raw.githubusercontent.com/Luffy-sama/Discord-Snake-Frame/main/snake_frame.png' }}
                        style={styles.snakeFrame}
                        resizeMode="contain"
                    />

                    {/* Centered Avatar/Initials */}
                    <View style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatarMain}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.initialsCircle}>
                                <Text style={styles.initialsText}>{initials}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Status Badges in Corners (Mirroring Main Card) */}
                <View style={[styles.micBadge, { flexDirection: 'row', gap: 4 }]}>
                    {isMicMuted && (
                        <Ionicons name="mic-off" size={10} color="#F23F42" />
                    )}
                    {!isCameraOff && (
                        <Ionicons name="videocam" size={10} color="#23A559" />
                    )}
                    {isCameraOff && (
                        <Ionicons name="videocam-off" size={10} color="#949BA4" />
                    )}
                </View>

                <View style={styles.activityBadge}>
                    <MaterialCommunityIcons name="gamepad-variant" size={14} color="#E51584" />
                </View>

                {/* Speaker Glow */}
                {!isMicMuted && (
                    <View style={styles.speakerBorder} pointerEvents="none" />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 999999,
    },
    card: {
        flex: 1,
        backgroundColor: '#111214', // Matching Main Card Dark Background
        borderRadius: 24, // Slightly less than main card but very rounded
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 12,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    snakeFrame: {
        position: 'absolute',
        width: 100,
        height: 100,
        zIndex: 10,
    },
    avatarContainer: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#2B2D31',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarMain: {
        width: '100%',
        height: '100%',
    },
    initialsCircle: {
        width: '100%',
        height: '100%',
        backgroundColor: '#5865F2', // Discord Purple
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    micBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activityBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    speakerBorder: {
        position: 'absolute',
        inset: 0,
        borderWidth: 3,
        borderColor: '#23A559',
        borderRadius: 24,
    },
});
