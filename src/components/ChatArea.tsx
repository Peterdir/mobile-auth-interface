import { chatApi, ChatMessage } from "@/src/api/chatApi";
import { WS_URL } from "../api/config";

import { Client } from "@stomp/stompjs";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { ServerMemberList } from "./ServerMemberList";

interface ChatAreaProps {
  channelId: number;
  channelName: string;
  serverId: number;
  onBack?: () => void;
}

interface SocketResponse {
  type: "CREATE" | "EDIT" | "DELETE";
  data: any;
}

const avatarColors = [
  ["#5865F2", "#EB459E"],
  ["#3BA55D", "#43B581"],
  ["#FAA61A", "#F04747"],
  ["#9B59B6", "#3498DB"],
  ["#ED4245", "#FEE75C"],
];

const getAvatarGradient = (id: number | string | null | undefined) => {
  if (!id) return avatarColors[0];
  const numId =
    typeof id === "number"
      ? id
      : parseInt(id.toString().replace(/\D/g, "") || "0", 10);
  return avatarColors[numId % avatarColors.length];
};

export const ChatArea = ({
  channelId,
  channelName,
  serverId,
  onBack,
}: ChatAreaProps) => {
  const user = useSelector((state: any) => state.auth.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const textRef = useRef("");
  const inputRef = useRef<TextInput>(null);
  const [isTyping, setIsTyping] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null,
  );
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [membersVisible, setMembersVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [activeNitroCard, setActiveNitroCard] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Animations
  const expandAnim = useRef(new Animated.Value(0)).current;
  const sendAnim = useRef(new Animated.Value(0)).current;

  const hasText = inputText.trim().length > 0;
  const canSend = hasText || selectedFiles.length > 0;
  const isExpanded = isFocused || canSend;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.spring(sendAnim, {
      toValue: canSend ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 20,
    }).start();
  }, [isExpanded, canSend]);

  useEffect(() => {
    loadHistory();
    connectWebSocket();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [channelId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatApi.getMessages(channelId);
      setMessages(data);
    } catch (error: any) {
      console.error("Error loading history:", error);
      if (
        error.message?.includes("403") ||
        error.message?.includes("Forbidden")
      ) {
        setError("Bạn không có quyền truy cập kênh này.");
      } else {
        setError("Không thể tải tin nhắn.");
      }
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    console.log("🔌 Attempting to connect WebSocket to:", WS_URL);

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${user?.token}`,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onConnect: () => {
        console.log("✅ Connected to WebSocket successfully!");
        client.subscribe(`/topic/channel/${channelId}`, (message) => {
          console.log("📨 Received message:", message.body);
          const body = JSON.parse(message.body);

          // Check if it's a SocketResponse or direct ChatMessageResponse
          // ChatMessageResponse has 'id', 'content', etc.
          // SocketResponse has 'type', 'data'

          if (body.type && body.data) {
            const socketRes = body as SocketResponse;
            if (socketRes.type === "DELETE") {
              const deletedId = socketRes.data as string;
              setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            } else if (socketRes.type === "EDIT") {
              const editedMsg = socketRes.data as ChatMessage;
              setMessages((prev) =>
                prev.map((m) => (m.id === editedMsg.id ? editedMsg : m)),
              );
            }
          } else {
            // Assume it's a new message (CREATE)
            const receivedMsg = body as ChatMessage;
            setMessages((prev) => [...prev, receivedMsg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
      },
      onWebSocketError: (event) => {
        console.error("❌ WebSocket Error:", event);
      },
      onWebSocketClose: (event) => {
        console.log("WebSocket Closed:", event);
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setSelectedFiles((prev) => [...prev, ...result.assets]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
    });

    if (!result.canceled) {
      setSelectedFiles((prev) => [...prev, ...result.assets]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!textRef.current.trim() && selectedFiles.length === 0) return;

    if (editMode && selectedMessage) {
      handleEditMessage(selectedMessage.id, textRef.current.trim());
      return;
    }

    if (!stompClient.current?.connected) return;

    setIsUploading(true);
    let attachments: string[] = [];

    try {
      // Upload all selected files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();

          // ImagePicker and DocumentPicker have slightly different structures
          const fileUri = file.uri;
          const fileName = file.name || fileUri.split('/').pop();
          const fileType = file.mimeType || "application/octet-stream";

          formData.append('file', {
            uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
            name: fileName,
            type: fileType,
          } as any);

          const uploadedUrl = await chatApi.uploadFile(formData);
          attachments.push(uploadedUrl);
        }
      }

      const messageContent = {
        senderId: user.id,
        content: textRef.current.trim(),
        attachments: attachments,
      };

      console.log("📤 Publishing message with attachments:", messageContent);

      stompClient.current.publish({
        destination: `/app/chat/${channelId}`,
        body: JSON.stringify(messageContent),
      });

      textRef.current = "";
      setInputText("");
      setSelectedFiles([]);
      inputRef.current?.clear();
    } catch (error) {
      console.error("Failed to upload files or send message:", error);
      Alert.alert("Lỗi", "Không thể tải tệp lên hoặc gửi tin nhắn.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMessage = async (id: string, newContent: string) => {
    try {
      await chatApi.editMessage(id, newContent);
      setEditMode(false);
      setSelectedMessage(null);
      textRef.current = "";
      setInputText("");
      inputRef.current?.clear();
    } catch (error) {
      console.error("Failed to edit message", error);
      Alert.alert("Lỗi", "Không thể sửa tin nhắn");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await chatApi.deleteMessage(id);
      setActionModalVisible(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message", error);
      Alert.alert("Lỗi", "Không thể xóa tin nhắn");
    }
  };

  const onLongPressMessage = (message: ChatMessage) => {
    if (message.senderId === user.id) {
      setSelectedMessage(message);
      setActionModalVisible(true);
    }
  };

  const parseDate = (dateInput: string | number[] | null | undefined) => {
    if (!dateInput) return new Date();
    if (Array.isArray(dateInput)) {
      // [year, month, day, hour, minute, second, nano]
      return new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3],
        dateInput[4],
        dateInput[5] || 0,
      );
    }
    return new Date(dateInput);
  };

  const formatTime = (dateInput: string | number[]) => {
    const date = parseDate(dateInput);
    const today = new Date();

    const timeString = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (date.toDateString() === today.toDateString()) {
      return timeString;
    } else {
      const dateString = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${dateString} ${timeString}`;
    }
  };

  const formatDate = (dateInput: string | number[]) => {
    const date = parseDate(dateInput);
    return `${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isMe = item.senderId === user.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;

    // Parse dates for comparison
    const itemDate = parseDate(item.createdAt);
    const prevDate = prevMessage ? parseDate(prevMessage.createdAt) : null;

    const showDateSeparator =
      !prevDate || itemDate.toDateString() !== prevDate.toDateString();
    const gradientColors = getAvatarGradient(item.senderId);

    let isSequence = false;
    if (
      !showDateSeparator &&
      prevMessage &&
      prevMessage.senderId === item.senderId
    ) {
      const timeDiff = itemDate.getTime() - prevDate!.getTime();
      if (timeDiff < 5 * 60 * 1000) {
        // 5 minutes collapse
        isSequence = true;
      }
    }

    return (
      <View>
        {/* Date Separator */}
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        {/* Message */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.messageContainer,
            selectedMessage?.id === item.id && styles.selectedMessage,
            isSequence
              ? styles.messageContainerSequence
              : styles.messageContainerFirst,
          ]}
          onLongPress={() => onLongPressMessage(item)}
        >
          {/* Avatar Column */}
          <View style={styles.avatarColumn}>
            {!isSequence && (
              <View style={styles.avatarContainer}>
                {item.senderAvatar ? (
                  <Image
                    source={{ uri: item.senderAvatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { backgroundColor: gradientColors[0] },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {item.senderName
                        ? item.senderName.charAt(0).toUpperCase()
                        : "U"}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.messageContent}>
            {!isSequence && (
              <View style={styles.messageHeader}>
                <Text style={[styles.senderName, isMe && styles.senderNameMe]}>
                  {item.senderName || "Unknown"}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            )}
            <Text style={styles.messageText}>
              {item.content}
              {(item as any).isEdited && (
                <Text style={styles.editedText}> (đã chỉnh sửa)</Text>
              )}
            </Text>

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {item.attachments.map((url, idx) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  return isImage ? (
                    <Image
                      key={idx}
                      source={{ uri: url }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <TouchableOpacity
                      key={idx}
                      style={styles.attachmentFile}
                      activeOpacity={0.7}
                    >
                      <IconButton icon="file" size={24} iconColor="#B5BAC1" />
                      <Text style={styles.attachmentFileName} numberOfLines={1}>
                        {url.split('/').pop()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
        <View style={styles.bannerIconContainer}>
          <IconButton
            icon="account-plus"
            size={20}
            iconColor="#B5BAC1"
            style={{ margin: 0 }}
          />
        </View>
        <Text style={styles.bannerText}>Mời bạn bè của bạn</Text>
        <View style={styles.bannerActionIcon}>
          <IconButton
            icon="check-circle"
            size={20}
            iconColor="#5865F2"
            style={{ margin: 0 }}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
        <View style={styles.bannerIconContainer}>
          <IconButton
            icon="format-paint"
            size={20}
            iconColor="#4FA0E8"
            style={{ margin: 0 }}
          />
        </View>
        <Text style={styles.bannerText}>Cá nhân hóa máy chủ của bạn</Text>
        <View style={styles.bannerActionIcon}>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor="#B5BAC1"
            style={{ margin: 0 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  // Imports for Modal if not already present, we'll use a simple View overlay or react-native Modal for now
  // Since we are inside ChatArea, let's just use a simple absolute view or Alert for MVP?
  // User requested "menu thao tác (khi nhấn giữ tin nhắn)".
  // Let's implement a custom Modal.

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      {/* Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tùy chọn tin nhắn</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setEditMode(true);
                textRef.current = selectedMessage?.content || "";
                setInputText(selectedMessage?.content || "");
                inputRef.current?.setNativeProps({ text: selectedMessage?.content || "" });
                setActionModalVisible(false);
              }}
            >
              <IconButton icon="pencil" size={20} iconColor="#B5BAC1" />
              <Text style={styles.modalOptionText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                if (selectedMessage) handleDeleteMessage(selectedMessage.id);
              }}
            >
              <IconButton icon="delete" size={20} iconColor="#F04747" />
              <Text style={[styles.modalOptionText, { color: "#F04747" }]}>
                Xóa tin nhắn
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor="#FFFFFF"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          )}
          <View style={styles.channelIcon}>
            <IconButton
              icon="pound"
              size={24}
              iconColor="#949BA4"
              style={{ margin: 0 }}
            />
          </View>
          <View>
            <Text style={styles.channelName}>{channelName}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <View style={styles.onlineDot} />
              <Text style={styles.channelDescription}>1 Trực tuyến</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <IconButton
              icon="magnify"
              size={28}
              iconColor="#B5BAC1"
              style={{ margin: 0 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Server Member List Modal */}
      <ServerMemberList
        visible={membersVisible}
        onClose={() => setMembersVisible(false)}
        serverId={serverId}
      />

      {/* Messages */}
      {error ? (
        <View style={styles.errorContainer}>
          <IconButton icon="alert-circle" size={48} iconColor="#F04747" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadHistory} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          {renderListHeader()}
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.emptyIconContainer}>
              <IconButton icon="message-text" size={48} iconColor="#5865F2" />
            </View>
            <Text style={styles.emptyTitle}>
              Chào mừng đến với #{channelName}!
            </Text>
            <Text style={styles.emptyDescription}>
              Đây là khởi đầu của kênh #{channelName}. Hãy bắt đầu cuộc trò
              chuyện!
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader}
        />
      )}

      {/* {!error && ( */}
      {!error && (
        <View style={styles.inputContainer}>
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <View style={styles.previewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedFiles.map((file, idx) => (
                  <View key={idx} style={styles.previewItem}>
                    {file.mimeType?.startsWith('image') || file.type?.startsWith('image') ? (
                      <Image source={{ uri: file.uri }} style={styles.previewImage} />
                    ) : (
                      <View style={styles.previewFileIcon}>
                        <IconButton icon="file" size={24} iconColor="#B5BAC1" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeFileBtn}
                      onPress={() => removeFile(idx)}
                    >
                      <IconButton icon="close" size={12} iconColor="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Plus, Grid, Gift Icons on Left */}
          {!editMode && (
            <TouchableOpacity
              style={styles.inputExternalIcon}
              onPress={() => {
                Alert.alert(
                  "Đính kèm",
                  "Chọn loại tệp bạn muốn gửi",
                  [
                    { text: "Ảnh", onPress: pickImage },
                    { text: "Tài liệu", onPress: pickDocument },
                    { text: "Hủy", style: "cancel" }
                  ]
                );
              }}
            >
              <IconButton
                icon="plus"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          )}
          {isUploading && (
            <View style={styles.uploadingIndicator}>
              <ActivityIndicator size="small" color="#5865F2" />
            </View>
          )}
          <Animated.View
            style={{
              flexDirection: "row",
              overflow: "hidden",
              width: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0],
              }),
              opacity: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
            <TouchableOpacity style={styles.inputExternalIcon}>
              <IconButton
                icon="apps"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputExternalIcon}
              onPress={() => setGiftModalVisible(true)}
              activeOpacity={0.8}
            >
              <IconButton
                icon="gift"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Pill Input */}
          <Animated.View style={[styles.inputWrapper, { flex: 1 }]}>
            <TextInput
              ref={inputRef}
              defaultValue=""
              onChangeText={(text) => {
                textRef.current = text;
                setInputText(text);
              }}
              placeholder={editMode ? "Đang sửa..." : `Nhắn #${channelName}`}
              placeholderTextColor="#72767D"
              style={styles.textInput}
              multiline
              onSubmitEditing={sendMessage}
              onFocus={() => {
                setIsFocused(true);
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
              }}
              onBlur={() => {
                setIsFocused(false);
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
              }}
            />
            <TouchableOpacity style={styles.inputInsideIcon}>
              <IconButton
                icon="emoticon-happy"
                size={22}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* External Right Icon */}
          <TouchableOpacity
            style={styles.inputExternalIconRight}
            onPress={canSend ? sendMessage : undefined}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                position: "absolute",
                opacity: sendAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    scale: sendAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.5],
                    }),
                  },
                ],
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <IconButton
                icon="microphone"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </Animated.View>

            <Animated.View
              style={{
                position: "absolute",
                opacity: sendAnim,
                transform: [{ scale: sendAnim }],
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <View style={styles.sendIconActive}>
                <IconButton
                  icon="send"
                  size={16}
                  iconColor="#FFFFFF"
                  style={{ margin: 0 }}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={() => {
                setEditMode(false);
                textRef.current = "";
                setInputText("");
                inputRef.current?.clear();
                setSelectedMessage(null);
              }}
            >
              <Text style={styles.cancelEditText}>Hủy sửa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* )} */}

      {/* Nitro Gift Modal */}
      <Modal
        visible={giftModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setGiftModalVisible(false)}
      >
        <View style={styles.giftModalOverlay}>
          {/* Header */}
          <View style={styles.giftModalHeader}>
            <TouchableOpacity
              onPress={() => setGiftModalVisible(false)}
              style={styles.giftCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconButton
                icon="close"
                size={24}
                iconColor="#FFFFFF"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.giftModalTitle}>
            Tặng gói thành viên Nitro mới
          </Text>
          <Text style={styles.giftModalSubtitle}>
            Cảnh báo: quà tặng có thể gây ra niềm vui không thể kiểm soát!
          </Text>

          {/* Cards Carousel */}
          <View style={styles.giftCarouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                alignItems: "center",
              }}
              onScroll={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const index = Math.round(
                  offset / (Dimensions.get("window").width - 40),
                );
                if (index !== activeNitroCard) setActiveNitroCard(index);
              }}
              scrollEventThrottle={16}
              snapToInterval={Dimensions.get("window").width - 24}
              decelerationRate="fast"
            >
              {/* Card 1: Nitro Basic */}
              <View style={[styles.nitroCard, { backgroundColor: "#00A8FC" }]}>
                <View style={styles.nitroCardTop}>
                  <View>
                    <Text style={styles.nitroCardHeaderBasic}>NITRO BASIC</Text>
                    <Text style={styles.nitroPriceText}>
                      Chọn từ 79.000 đ/{"\n"}tháng hoặc{"\n"}779.000 đ/năm
                    </Text>
                  </View>
                  <View style={styles.nitroMascotPlaceholder}>
                    <Image
                      source={require("@/assets/images/nitro_basic.png")}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <Text style={styles.nitroTargetText}>
                  Người nhận của bạn sẽ được:
                </Text>

                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="upload"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>Tải lên 50MB</Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="emoticon-happy"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Emoji tùy chọn tại bất cứ đâu
                  </Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="fan"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Huy hiệu Nitro đặc biệt trên trang cá nhân của bạn
                  </Text>
                </View>

                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={styles.nitroActionBtn}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.nitroActionBtnText, { color: "#00A8FC" }]}
                  >
                    Tặng Gói Nitro Cơ Bản
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Card 2: Nitro Standard */}
              <View style={[styles.nitroCard, { backgroundColor: "#B538C4" }]}>
                <View style={styles.nitroCardTop}>
                  <View>
                    <Text style={styles.nitroCardHeader}>NITRO</Text>
                    <Text style={styles.nitroPriceText}>
                      Chọn từ 231.000 đ/{"\n"}tháng hoặc{"\n"}2.300.000 đ/năm
                    </Text>
                  </View>
                  <View style={styles.nitroMascotPlaceholder}>
                    <Image
                      source={require("@/assets/images/nitro_standard.png")}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <Text style={styles.nitroTargetText}>
                  Người nhận của bạn sẽ được:
                </Text>

                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="upload"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>Tải lên 500MB</Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="emoticon-happy"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Emoji tùy chọn tại bất cứ đâu
                  </Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="star"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Biểu Cảm Siêu Cấp Không Giới Hạn
                  </Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="monitor"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Đang stream video HD
                  </Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="server"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    2 Nâng Cấp Máy Chủ
                  </Text>
                </View>
                <View style={styles.nitroFeatureRow}>
                  <IconButton
                    icon="account-box"
                    size={20}
                    iconColor="#FFFFFF"
                    style={styles.nitroFeatureIcon}
                  />
                  <Text style={styles.nitroFeatureText}>
                    Hồ sơ tùy chỉnh và hơn thế nữa!
                  </Text>
                </View>

                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={styles.nitroActionBtn}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.nitroActionBtnText, { color: "#B538C4" }]}
                  >
                    Tặng Nitro
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Pagination Indicators */}
          <View style={styles.giftPagination}>
            <View
              style={[
                styles.paginationDot,
                activeNitroCard === 0 && styles.paginationDotActive,
              ]}
            />
            <View
              style={[
                styles.paginationDot,
                activeNitroCard === 1 && styles.paginationDotActive,
              ]}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#313338",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#313338",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#B5BAC1",
    fontSize: 14,
  },
  // Header
  header: {
    height: 52,
    backgroundColor: "#313338",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 4,
  },
  channelIcon: {
    marginRight: 4,
  },
  channelName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  channelDescription: {
    color: "#3BA55D",
    fontSize: 12,
    fontWeight: "500",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3BA55D",
    marginRight: 6,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 4,
  },
  // Banners
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1F22",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bannerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2B2D31",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
    color: "#DCDDDE",
    fontSize: 15,
    fontWeight: "700",
  },
  bannerActionIcon: {
    marginLeft: 8,
  },
  // Messages List
  messagesList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#3F4147",
  },
  dateText: {
    color: "#949BA4",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  // Message
  messageContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  messageContainerFirst: {
    marginTop: 16,
  },
  messageContainerSequence: {
    marginTop: 0,
  },
  avatarColumn: {
    width: 40,
    marginRight: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  senderName: {
    color: "#F2F3F5",
    fontSize: 15,
    fontWeight: "600",
    marginRight: 8,
  },
  senderNameMe: {
    color: "#5865F2",
  },
  timestamp: {
    color: "#949BA4",
    fontSize: 11,
  },
  messageText: {
    color: "#DCDDDE",
    fontSize: 15,
    lineHeight: 22,
  },
  editedText: {
    color: "#949BA4",
    fontSize: 11,
  },
  // Error & Empty
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#B5BAC1",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#5865F2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5865F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#949BA4",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: "#313338",
  },
  inputExternalIcon: {
    width: 36,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#1E1F22",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 6,
    minHeight: 40,
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    color: "#DCDDDE",
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxHeight: 120,
  },
  inputInsideIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  inputExternalIconRight: {
    width: 44,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  sendIconActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5865F2",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelEditBtn: {
    position: "absolute",
    top: -24,
    left: 16,
    backgroundColor: "#2B2D31",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cancelEditText: {
    color: "#B5BAC1",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#313338",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: "#F2F3F5",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F22",
  },
  modalOptionText: {
    color: "#B5BAC1",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  // Nitro Gift Modal
  giftModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
  },
  giftModalHeader: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  giftCloseBtn: {
    marginBottom: 10,
  },
  giftModalTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  giftModalSubtitle: {
    color: "#B5BAC1",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  giftCarouselContainer: {
    height: 520,
    width: "100%",
  },
  nitroCard: {
    width: Dimensions.get("window").width - 40,
    height: "100%",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 8,
  },
  nitroCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  nitroCardHeaderBasic: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 4,
  },
  nitroCardHeader: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 4,
  },
  nitroPriceText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  nitroMascotPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  nitroTargetText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  nitroFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nitroFeatureIcon: {
    margin: 0,
    marginRight: 12,
    marginTop: -6,
  },
  nitroFeatureText: {
    color: "#FFFFFF",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  nitroActionBtn: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nitroActionBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  giftPagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3F4147",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#5865F2",
    width: 16,
  },
  attachmentsContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#2B2D31",
  },
  attachmentFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D31",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 250,
  },
  attachmentFileName: {
    color: "#00A8FC",
    fontSize: 14,
    marginLeft: 4,
  },
  previewContainer: {
    position: "absolute",
    top: -90,
    left: 16,
    right: 16,
    height: 80,
    backgroundColor: "#2B2D31",
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
  previewItem: {
    width: 64,
    height: 64,
    marginRight: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1E1F22",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewFileIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  removeFileBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ED4245",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingIndicator: {
    padding: 8,
    justifyContent: "center",
  },
});
