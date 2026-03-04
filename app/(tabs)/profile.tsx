import { profileApi, UserProfile } from "@/src/api/profileApi";
import { storage } from "@/src/utils/storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Modal,
  Provider as PaperProvider,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Discord Colors
// Discord Colors
const DISCORD = {
  blurple: "#5865F2",
  green: "#23A559",
  yellow: "#FEE75C",
  red: "#DA373C",
  white: "#FFFFFF",
  black: "#000000",
  darkBg: "#111214", // Main background
  cardBg: "#1E1F22", // Card background
  cardBgSecondary: "#2B2D31",
  inputBg: "#1E1F22",
  text: "#F2F3F5",
  textMuted: "#B5BAC1",
  textDark: "#949BA4",
  divider: "#3F4147",
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [visibleNameModal, setVisibleNameModal] = useState(false);
  const [visibleBioModal, setVisibleBioModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [uploading, setUploading] = useState(false);

  // Animations
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();

    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setNewName(data.displayName || "");
      setNewBio(data.bio || "");
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không tải được thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await storage.removeToken();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      await profileApi.uploadAvatar(uri);
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
      fetchProfile();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const updateName = async () => {
    if (!newName.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống");
      return;
    }
    try {
      await profileApi.updateProfile({ displayName: newName });
      Alert.alert("Thành công", "Đã cập nhật tên");
      setVisibleNameModal(false);
      fetchProfile();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Cập nhật thất bại");
    }
  };

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkBg} />
        <ActivityIndicator size="large" color={DISCORD.blurple} />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: DISCORD.darkBg }}
    >
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkBg} />

        {/* Custom Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <IconButton
                icon="weather-night"
                size={24}
                iconColor={DISCORD.text}
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <IconButton
                icon="storefront"
                size={24}
                iconColor={DISCORD.text}
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerIcon,
                styles.nitroHeaderBadge,
                { overflow: "hidden" },
              ]}
              activeOpacity={0.8}
            >
              {/* Shimmer Effect */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    width: "40%",
                    transform: [{ translateX }, { skewX: "-20deg" }],
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconButton
                  icon="asterisk"
                  size={16}
                  iconColor={DISCORD.text}
                  style={{ margin: 0, marginRight: 4 }}
                />
              </Animated.View>
              <Text style={styles.nitroHeaderText}>Nitro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => Alert.alert("Cài đặt", "Mở menu cài đặt")}
            >
              <IconButton
                icon="cog"
                size={24}
                iconColor={DISCORD.text}
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Banner & Avatar Section */}
          <View style={styles.profileHeaderSection}>
            <View style={styles.bannerContainer}>
              <View style={styles.banner} />
            </View>

            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={pickImage}
                disabled={uploading}
                activeOpacity={0.8}
              >
                <View style={styles.avatarBorderFancy}>
                  {profile?.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {profile?.displayName?.substring(0, 2).toUpperCase() ||
                          "??"}
                      </Text>
                    </View>
                  )}
                  {/* Online Status */}
                  <View style={styles.statusBadge}>
                    <View style={styles.statusBadgeInner} />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.statusBubble}>
                <IconButton
                  icon="plus-circle"
                  size={16}
                  iconColor={DISCORD.textMuted}
                  style={{ margin: 0, marginRight: 6 }}
                />
                <Text style={styles.statusBubbleText} numberOfLines={1}>
                  Nếu cuộc sống của bạn có một bài nhạc nền...
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Info & Buttons */}
          <View style={styles.profileCard}>
            {/* Name & Username */}
            <View style={styles.nameSection}>
              <View style={styles.displayNameRow}>
                <Text style={styles.displayName}>
                  {profile?.displayName || "Duy"}
                </Text>
                <IconButton
                  icon="chevron-down"
                  size={20}
                  iconColor={DISCORD.textMuted}
                  style={{ margin: 0, marginLeft: 0 }}
                />
              </View>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>
                  {profile?.username || "peter_18352"}
                </Text>
                <IconButton
                  icon="star-four-points-circle-outline"
                  size={18}
                  iconColor={DISCORD.blurple}
                  style={{ margin: 0, marginLeft: 4 }}
                />
              </View>
            </View>

            {/* Action Button: Edit Profile Full */}
            <TouchableOpacity
              style={styles.editProfileButtonFull}
              activeOpacity={0.8}
              onPress={() => setVisibleNameModal(true)}
            >
              <IconButton
                icon="pencil"
                size={16}
                iconColor={DISCORD.white}
                style={{ margin: 0, marginRight: 8 }}
              />
              <Text style={styles.editProfileButtonText}>Sửa Hồ Sơ</Text>
            </TouchableOpacity>

            {/* Nitro Promo Card */}
            <View style={styles.promoCardWrapper}>
              <View style={styles.promoCard}>
                <View style={styles.promoHeader}>
                  <Text style={styles.promoTitle}>Cải thiện hồ sơ của bạn</Text>
                  <IconButton
                    icon="close"
                    size={20}
                    iconColor={DISCORD.textMuted}
                    style={{ margin: 0 }}
                  />
                </View>
                <View style={styles.promoButtons}>
                  <TouchableOpacity
                    style={[styles.promoBtn, { overflow: "hidden" }]}
                    activeOpacity={0.8}
                  >
                    {/* Shimmer Effect */}
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          width: "40%",
                          transform: [{ translateX }, { skewX: "-20deg" }],
                        },
                      ]}
                    />
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <IconButton
                        icon="asterisk"
                        size={18}
                        iconColor={DISCORD.text}
                        style={{ margin: 0, marginRight: 6 }}
                      />
                    </Animated.View>
                    <Text style={styles.promoBtnText}>Nhận Nitro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.promoBtn}>
                    <IconButton
                      icon="storefront"
                      size={18}
                      iconColor={DISCORD.text}
                      style={{ margin: 0, marginRight: 6 }}
                    />
                    <Text style={styles.promoBtnText}>Cửa hàng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Info Card: Orbs */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Số dư Orbs</Text>
              <View style={styles.orbBadge}>
                <IconButton
                  icon="circle-slice-8"
                  size={14}
                  iconColor={DISCORD.text}
                  style={{ margin: 0, marginRight: 4 }}
                />
                <Text style={styles.orbText}>200</Text>
              </View>
            </View>

            {/* Info Card: Gia Nhập Từ */}
            <View style={styles.infoCardVertical}>
              <Text style={styles.infoCardTitle}>Gia Nhập Từ</Text>
              <View style={styles.dateRow}>
                <IconButton
                  icon="discord"
                  size={18}
                  iconColor={DISCORD.textMuted}
                  style={{ margin: 0, marginRight: 8 }}
                />
                <Text style={styles.dateText}>
                  {new Date()
                    .toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    .replace("thg", "thg")}
                </Text>
              </View>
            </View>

            {/* Info Card: Bạn bè */}
            <TouchableOpacity style={styles.infoCardRow} activeOpacity={0.7}>
              <Text style={styles.infoCardTitle}>Bạn bè</Text>
              <View style={styles.friendsRight}>
                <View style={styles.friendsStack}>
                  <View
                    style={[
                      styles.friendAvatar,
                      { backgroundColor: DISCORD.green, zIndex: 3 },
                    ]}
                  />
                  <View
                    style={[
                      styles.friendAvatar,
                      {
                        backgroundColor: DISCORD.blurple,
                        zIndex: 2,
                        marginLeft: -12,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.friendAvatar,
                      {
                        backgroundColor: DISCORD.red,
                        zIndex: 1,
                        marginLeft: -12,
                      },
                    ]}
                  />
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  iconColor={DISCORD.textMuted}
                  style={{ margin: 0, marginLeft: 2, marginRight: -8 }}
                />
              </View>
            </TouchableOpacity>

            {/* Info Card: Ghi chú */}
            <TouchableOpacity style={styles.infoCardRow} activeOpacity={0.7}>
              <Text style={styles.infoCardTitle}>
                Ghi chú (chỉ hiển thị cho bạn)
              </Text>
              <IconButton
                icon="notebook-outline"
                size={24}
                iconColor={DISCORD.textMuted}
                style={{ margin: 0, marginRight: -8 }}
              />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.infoCardRow, { marginTop: 12 }]}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <Text style={[styles.infoCardTitle, { color: DISCORD.red }]}>
                Đăng xuất
              </Text>
              <IconButton
                icon="logout"
                size={24}
                iconColor={DISCORD.red}
                style={{ margin: 0, marginRight: -8 }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />

          {/* Modals */}
          <Portal>
            <Modal
              visible={visibleNameModal}
              onDismiss={() => setVisibleNameModal(false)}
              contentContainerStyle={styles.modalContainer}
            >
              <Text style={styles.modalTitle}>Đổi tên hiển thị</Text>
              <Text style={styles.modalLabel}>TÊN HIỂN THỊ</Text>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor={DISCORD.textDark}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setVisibleNameModal(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={updateName}
                >
                  <Text style={styles.modalSaveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </Portal>
        </ScrollView>
      </PaperProvider>
    </SafeAreaView>
  );
}

// Settings Item Component
const SettingsItem = ({
  icon,
  label,
  value,
  onPress,
  isFirst,
  isLast,
  isDestructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isDestructive?: boolean;
}) => (
  <View
    style={[
      styles.settingsItemContainer,
      isFirst && styles.settingsItemFirst,
      isLast && styles.settingsItemLast,
      !isLast && styles.settingsItemBorder,
    ]}
  >
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <IconButton
          icon={icon}
          size={24}
          iconColor={isDestructive ? DISCORD.red : DISCORD.textMuted}
          style={{ margin: 0, marginRight: 16 }}
        />
        <Text
          style={[
            styles.settingsItemLabel,
            isDestructive && { color: DISCORD.red },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {!!value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {!isDestructive && (
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor={DISCORD.textDark}
            style={{ margin: 0, marginRight: -8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DISCORD.darkBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DISCORD.darkBg,
  },
  // Header
  header: {
    height: 56,
    backgroundColor: DISCORD.darkBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 12,
  },
  nitroHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DISCORD.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nitroHeaderText: {
    color: DISCORD.text,
    fontSize: 14,
    fontWeight: "700",
  },
  // Avatar and Status
  profileHeaderSection: {
    // Wrapper for banner + avatar
  },
  bannerContainer: {
    height: 120,
    backgroundColor: DISCORD.cardBg, // fallback
  },
  banner: {
    flex: 1,
    backgroundColor: "#5865F2", // Default Discord blurple banner
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -40, // overlap banner
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarBorderFancy: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: DISCORD.cardBg,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9B84EE",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: DISCORD.blurple,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: DISCORD.white,
    fontSize: 28,
    fontWeight: "700",
  },
  statusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DISCORD.darkBg,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DISCORD.green,
  },
  statusBubble: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DISCORD.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    borderTopLeftRadius: 4,
    marginTop: 40, // push down since avatar is shifted up by 40
  },
  statusBubbleText: {
    color: DISCORD.textMuted,
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
  // Profile Card Info
  profileCard: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  nameSection: {
    marginBottom: 16,
  },
  displayNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    fontSize: 28,
    fontWeight: "800",
    color: DISCORD.text,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  username: {
    fontSize: 15,
    color: DISCORD.textMuted,
    fontWeight: "500",
  },
  editProfileButtonFull: {
    backgroundColor: DISCORD.blurple,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  editProfileButtonText: {
    color: DISCORD.white,
    fontSize: 15,
    fontWeight: "700",
  },
  promoCardWrapper: {
    borderRadius: 16,
    padding: 2,
    backgroundColor: "#7A4AB5",
    marginBottom: 12,
  },
  promoCard: {
    backgroundColor: DISCORD.cardBg,
    borderRadius: 14,
    padding: 16,
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  promoTitle: {
    color: DISCORD.text,
    fontSize: 14,
    fontWeight: "700",
  },
  promoButtons: {
    flexDirection: "row",
    gap: 8,
  },
  promoBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: DISCORD.cardBgSecondary,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  promoBtnText: {
    color: DISCORD.text,
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DISCORD.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoCardVertical: {
    backgroundColor: DISCORD.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DISCORD.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoCardTitle: {
    color: DISCORD.text,
    fontSize: 15,
    fontWeight: "700",
  },
  orbBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DISCORD.cardBgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  orbText: {
    color: DISCORD.text,
    fontSize: 15,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    color: DISCORD.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  friendsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendsStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: DISCORD.cardBg,
  },
  // Settings Item (Fallback for remaining items if any)
  settingsItemContainer: {
    backgroundColor: DISCORD.cardBg,
  },
  settingsItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  settingsItemLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DISCORD.divider,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemLabel: {
    fontSize: 16,
    color: DISCORD.text,
    fontWeight: "500",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemValue: {
    fontSize: 15,
    color: DISCORD.textMuted,
    marginRight: 4,
  },
  // Modal
  modalContainer: {
    backgroundColor: DISCORD.cardBg,
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DISCORD.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: DISCORD.textMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: DISCORD.inputBg,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: DISCORD.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: DISCORD.textMuted,
    fontWeight: "500",
  },
  modalSaveButton: {
    backgroundColor: DISCORD.blurple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  modalSaveText: {
    fontSize: 14,
    color: DISCORD.white,
    fontWeight: "600",
  },
});
