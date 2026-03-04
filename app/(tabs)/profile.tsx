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
  Modal as RNModal,
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
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Store Modal State
  const [storeModalVisible, setStoreModalVisible] = useState(false);

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
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
              onPress={() => setStoreModalVisible(true)}
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
                    onPress={() => setStoreModalVisible(true)}
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

        {/* Nitro Store Modal */}
        <RNModal
          visible={storeModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setStoreModalVisible(false)}
        >
          <SafeAreaView style={styles.storeContainer} edges={["top", "bottom"]}>
            {/* Store Header */}
            <View style={styles.storeHeader}>
              <TouchableOpacity
                onPress={() => setStoreModalVisible(false)}
                style={styles.storeCloseBtn}
              >
                <IconButton
                  icon="arrow-left"
                  size={24}
                  iconColor="#FFFFFF"
                  style={{ margin: 0 }}
                />
              </TouchableOpacity>
              <View style={styles.storeHeaderTitleWrapper}>
                <IconButton
                  icon="discord"
                  size={20}
                  iconColor="#FFFFFF"
                  style={{ margin: 0, marginRight: 4 }}
                />
                <Text style={styles.storeHeaderDiscord}>Discord</Text>
              </View>
              <Text style={styles.storeHeaderNitro}>NITRO</Text>
            </View>

            <ScrollView
              style={styles.storeScrollView}
              contentContainerStyle={styles.storeScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.storeSubtitle}>
                Khám phá nhiều niềm vui hơn trên Discord
              </Text>

              {/* Nitro Standard Card */}
              <View style={styles.storeCardStandard}>
                <View style={styles.storeCardHeader}>
                  <Text style={styles.storeCardTitleStandard}>NITRO</Text>
                  <Text style={styles.storeCardPrice}>
                    113.000 ₫{" "}
                    <Text style={styles.storeCardPriceUnit}>/ tháng</Text>
                  </Text>
                </View>

                <View style={styles.storeFeatureList}>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="upload"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>Tải lên 500MB</Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="emoticon-happy-outline"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Emoji tùy chọn tại bất cứ đâu
                    </Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="star-face"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Biểu Cảm Siêu Cấp Không Giới Hạn
                    </Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="monitor-share"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Đang stream video HD
                    </Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="rocket-launch"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      2 Nâng Cấp Máy Chủ
                    </Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="account-details"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Hồ sơ tùy chỉnh và hơn thế nữa!
                    </Text>
                  </View>
                </View>

                <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                  <TouchableOpacity
                    style={styles.storeCardButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.storeCardButtonTextStandard}>
                      Lấy Nitro
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Image
                  source={require("../../assets/images/nitro_standard.png")}
                  style={styles.storeMascotStandard}
                />
              </View>

              {/* Nitro Basic Card */}
              <View style={styles.storeCardBasic}>
                <View style={styles.storeCardHeader}>
                  <Text style={styles.storeCardTitleBasic}>NITRO BASIC</Text>
                  <Text style={styles.storeCardPrice}>
                    42.000 ₫{" "}
                    <Text style={styles.storeCardPriceUnit}>/ tháng</Text>
                  </Text>
                </View>

                <View style={styles.storeFeatureList}>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="upload"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>Tải lên 50MB</Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="emoticon-happy-outline"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Emoji tùy chọn tại bất cứ đâu
                    </Text>
                  </View>
                  <View style={styles.storeFeatureItem}>
                    <IconButton
                      icon="shield-star"
                      size={16}
                      iconColor="#E5E5E5"
                      style={{ margin: 0, marginRight: 8 }}
                    />
                    <Text style={styles.storeFeatureText}>
                      Huy hiệu Nitro đặc biệt trên trang cá nhân của bạn
                    </Text>
                  </View>
                </View>

                <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                  <TouchableOpacity
                    style={styles.storeCardButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.storeCardButtonTextBasic}>
                      Tải Basic
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Image
                  source={require("../../assets/images/nitro_basic.png")}
                  style={styles.storeMascotBasic}
                />
              </View>

              {/* Comparison Table */}
              <View style={styles.storeTableContainer}>
                <Text style={styles.storeTableTitle}>
                  Các đặc quyền Nitro yêu thích
                </Text>
                <View style={styles.storeTableTitleRow}>
                  <Text style={styles.storeTableTitleLeft}>
                    Chọn gói đăng ký của bạn
                  </Text>
                </View>

                {/* Table Headers */}
                <View style={styles.storeTableRow}>
                  <View style={styles.storeTableColEmpty}></View>
                  <View style={styles.storeTableColBasic}>
                    <Text style={styles.storeTableColHeaderBasic}>BASIC</Text>
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <Text style={styles.storeTableColHeaderStandard}>
                      NITRO
                    </Text>
                  </View>
                </View>

                {/* Table Row 1 */}
                <View style={[styles.storeTableRow, styles.storeTableRowBg]}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Giá hàng tháng
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <Text style={styles.storeTableValueText}>42.000 ₫</Text>
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <Text style={styles.storeTableValueText}>113.000 ₫</Text>
                  </View>
                </View>

                {/* Table Row 2 */}
                <View style={styles.storeTableRow}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Emoji và sticker tùy chỉnh ở mọi nơi
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>

                {/* Table Row 3 */}
                <View style={[styles.storeTableRow, styles.storeTableRowBg]}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Tải lên Tệp tin Dung lượng Lớn
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <Text style={styles.storeTableValueText}>50 MB</Text>
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <Text style={styles.storeTableValueText}>500 MB</Text>
                  </View>
                </View>

                {/* Table Row 4 */}
                <View style={styles.storeTableRow}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Huy hiệu hồ sơ Nitro
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>

                {/* Table Row 5 */}
                <View style={[styles.storeTableRow, styles.storeTableRowBg]}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      2 Nâng Cấp Máy Chủ
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor="#4E5058"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>

                {/* Table Row 6 */}
                <View style={styles.storeTableRow}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Ảnh đại diện hoạt hình, và tùy chỉnh hồ sơ
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor="#4E5058"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>

                {/* Table Row 7 */}
                <View style={[styles.storeTableRow, styles.storeTableRowBg]}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Đang stream video HD
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor="#4E5058"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>

                {/* Table Row 8 */}
                <View style={styles.storeTableRow}>
                  <View style={styles.storeTableColFeature}>
                    <Text style={styles.storeTableFeatureText}>
                      Và thêm các mục khác nữa!
                    </Text>
                  </View>
                  <View style={styles.storeTableColBasic}>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor="#4E5058"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                  <View style={styles.storeTableColStandard}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor="#DCDDDE"
                      style={{ margin: 0, padding: 0, height: 20 }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.storeFooter}>
                <Text style={styles.storeFooterText}>
                  Giải phóng niềm vui cùng Nitro!
                </Text>
                <Animated.View
                  style={{ width: "100%", transform: [{ scale: pulseValue }] }}
                >
                  <TouchableOpacity
                    style={styles.storeFooterButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.storeFooterButtonText}>Lấy Nitro</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </RNModal>
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

  // --- NITRO STORE MODAL STYLES ---
  storeContainer: {
    flex: 1,
    backgroundColor: "#111214",
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F22",
  },
  storeCloseBtn: {
    marginRight: 16,
  },
  storeHeaderTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeHeaderDiscord: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    marginRight: 6,
  },
  storeHeaderNitro: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
  },
  storeScrollView: {
    flex: 1,
  },
  storeScrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  storeSubtitle: {
    color: "#B5BAC1",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 24,
  },

  // Cards
  storeCardStandard: {
    backgroundColor: "#8d4ff0", // Base fallback
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#b983ff",
  },
  storeCardBasic: {
    backgroundColor: "#0F51E3", // Base fallback
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    overflow: "hidden",
  },
  storeCardHeader: {
    marginBottom: 16,
  },
  storeCardTitleStandard: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 4,
  },
  storeCardTitleBasic: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 4,
  },
  storeCardPrice: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  storeCardPriceUnit: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  storeFeatureList: {
    marginBottom: 24,
    zIndex: 2,
  },
  storeFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 80, // Leave space for mascot
  },
  storeFeatureText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flexWrap: "wrap",
  },
  storeCardButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 2,
  },
  storeCardButtonTextStandard: {
    color: "#8d4ff0",
    fontSize: 16,
    fontWeight: "700",
  },
  storeCardButtonTextBasic: {
    color: "#0F51E3",
    fontSize: 16,
    fontWeight: "700",
  },

  // Mascots
  storeMascotStandard: {
    position: "absolute",
    top: 20,
    right: -10,
    width: 140,
    height: 140,
    resizeMode: "contain",
    zIndex: 1,
    opacity: 0.9,
  },
  storeMascotBasic: {
    position: "absolute",
    top: 20,
    right: -10,
    width: 130,
    height: 130,
    resizeMode: "contain",
    zIndex: 1,
    opacity: 0.9,
  },

  // Table
  storeTableContainer: {
    marginTop: 16,
  },
  storeTableTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  storeTableTitleRow: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2B2D31",
    paddingBottom: 8,
  },
  storeTableTitleLeft: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  storeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  storeTableRowBg: {
    backgroundColor: "#1E1F22",
  },
  storeTableColEmpty: {
    flex: 2,
  },
  storeTableColFeature: {
    flex: 2,
    paddingRight: 8,
  },
  storeTableFeatureText: {
    color: "#DCDDDE",
    fontSize: 13,
    fontWeight: "500",
  },
  storeTableColBasic: {
    flex: 1,
    alignItems: "center",
  },
  storeTableColHeaderBasic: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
  },
  storeTableColStandard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#313338",
    borderRadius: 8,
    paddingVertical: 8,
  },
  storeTableColHeaderStandard: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
  },
  storeTableValueText: {
    color: "#B5BAC1",
    fontSize: 13,
    fontWeight: "600",
  },

  // Footer
  storeFooter: {
    marginTop: 40,
    alignItems: "center",
  },
  storeFooterText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  storeFooterButton: {
    backgroundColor: "#5865F2",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  storeFooterButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
