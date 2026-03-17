import {
  directMessageApi,
  DirectMessageResponse,
} from "@/src/api/directMessageApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { WS_URL } from "../api/config";

interface DirectMessageChatAreaProps {
  conversationId: string;
  friendId: number;
  friendName: string;
  onBack: () => void;
}

const DISCORD_COLORS = {
  background: "#000000",
  secondaryBg: "#111214",
  pillInput: "#1E1F22",
  text: "#F2F3F5",
  textMuted: "#949BA4",
  textDark: "#80848E",
  blurple: "#5865F2",
  green: "#23A559",
  iconMuted: "#B5BAC1",
  divider: "#1E1F22",
  danger: "#F04747",
};

const getAvatarGradient = (id: number) =>
  ["#5865F2", "#EB459E", "#3BA55D", "#FAA61A", "#9B59B6"][id % 5];

export const DirectMessageChatArea = ({
  conversationId,
  friendId,
  friendName,
  onBack,
}: DirectMessageChatAreaProps) => {
  const user = useSelector((state: any) => state.auth.user);
  const presenceMap = useSelector((state: any) => state.presence?.statusMap || {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return "#23A559";
      case 'IDLE': return '#FAA61A';
      case 'DND': return '#F04747';
      default: return '#80848E';
    }
  };

  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const textRef = useRef("");
  const inputRef = useRef<TextInput>(null);
  const stompClient = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    connectWebSocket();
    unhideConversation();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [conversationId]);

  const unhideConversation = async () => {
    try {
      const hiddenStr = await AsyncStorage.getItem(`hidden_dms_${user?.id}`);
      if (hiddenStr) {
        let hiddenList: string[] = JSON.parse(hiddenStr);
        if (hiddenList.includes(conversationId)) {
          hiddenList = hiddenList.filter(id => id !== conversationId);
          await AsyncStorage.setItem(`hidden_dms_${user?.id}`, JSON.stringify(hiddenList));
        }
      }
    } catch (error) {
      console.error("Error unhiding conversation:", error);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await directMessageApi.getMessages(conversationId);
      // data.content contains the list if it's a Page object
      const msgList = data.content ? data.content : data;
      setMessages([...msgList].reverse());
    } catch (error: any) {
      console.error("Error loading DM history:", error);
      setError("Không thể tải tin nhắn.");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        login: user.username, // Should likely use proper auth headers if supported
        passcode: "guest",
      },
      debug: (str) => {
        // console.log("STOMP Debug (DM):", str);
      },
      reconnectDelay: 5000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onConnect: () => {
        console.log("✅ DMs: Connected to WebSocket!");
        // Subscribe to user specific queue
        client.subscribe(`/user/queue/dm`, (message) => {
          console.log("📨 Received DM:", message.body);
          const receivedMsg: DirectMessageResponse = JSON.parse(message.body);
          if (receivedMsg.conversationId === conversationId) {
            setMessages((prev) => [...prev, receivedMsg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error (DM):", frame.headers["message"]);
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const sendMessage = async () => {
    if (!textRef.current.trim()) return;

    try {
      await directMessageApi.sendMessage(friendId, textRef.current.trim());
      textRef.current = "";
      setInputText("");
      inputRef.current?.clear();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: DirectMessageResponse;
    index: number;
  }) => {
    const isMe = item.senderId === user.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const itemDate = new Date(item.createdAt);
    const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;

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
      <View key={item.id}>
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
            isSequence
              ? styles.messageContainerSequence
              : styles.messageContainerFirst,
          ]}
        >
          {/* Avatar Column */}
          <View style={styles.avatarColumn}>
            {!isSequence ? (
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
                      { backgroundColor: getAvatarGradient(item.senderId) },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {(item.senderName || friendName).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.sequenceTime}>
                {new Date(item.createdAt).getHours()}:{String(new Date(item.createdAt).getMinutes()).padStart(2, '0')}
              </Text>
            )}
          </View>

          {/* Content */}
          <View style={styles.messageContent}>
            {!isSequence && (
              <View style={styles.messageHeader}>
                <Text style={[styles.senderName, isMe && styles.senderNameMe]}>
                  {item.senderName || (isMe ? user.displayName : friendName)}
                </Text>
                <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
              </View>
            )}
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.container, { paddingBottom: 0 }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#313338" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor="#949BA4"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>

            <View style={styles.headerAvatarContainer}>
              <View style={[styles.headerAvatarPlaceholder, { backgroundColor: getAvatarGradient(friendId)[0] }]}>
                <Text style={styles.headerAvatarText}>{friendName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={[styles.headerStatusIndicator, { backgroundColor: getStatusColor(presenceMap[friendId]) }]} />
            </View>

            <View style={styles.headerNameContainer}>
              <Text numberOfLines={1} style={styles.headerNameText}>{friendName}</Text>
              <IconButton
                icon="chevron-right"
                size={22}
                iconColor="#949BA4"
                style={{ margin: 0, marginLeft: -4 }}
              />
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <IconButton
                icon="phone"
                size={24}
                iconColor="#FFFFFF"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <IconButton
                icon="video"
                size={24}
                iconColor="#FFFFFF"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <IconButton
                icon="magnify"
                size={24}
                iconColor="#FFFFFF"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <IconButton icon="account" size={48} iconColor="#5865F2" />
              </View>
              <Text style={styles.emptyTitle}>{friendName}</Text>
              <Text style={styles.emptyDescription}>
                Đây là khởi đầu cuộc trò chuyện với {friendName}.
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <View style={styles.externalActionIcons}>
            <TouchableOpacity style={styles.inputExternalIconPlus}>
              <IconButton
                icon="plus"
                size={20}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputExternalIconSmall}>
              <IconButton
                icon="apps"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputExternalIconSmall}>
              <IconButton
                icon="gift"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>

          {/* Input Field & Inline Buttons */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              defaultValue=""
              onChangeText={(text) => {
                textRef.current = text;
                setInputText(text);
              }}
              placeholder={`Nhắn @${friendName}`}
              placeholderTextColor="#72767D"
              style={styles.textInput}
              multiline
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.inputInsideIcon}>
              <IconButton
                icon="emoticon-happy"
                size={24}
                iconColor="#B5BAC1"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>

          {/* Right Side Buttons: Send (if text exists) OR Microphone */}
          <TouchableOpacity
            onPress={inputText.trim() ? sendMessage : () => { }}
            style={styles.inputExternalIconRight}
          >
            {inputText.trim() ? (
              <View style={styles.sendIconActive}>
                <IconButton
                  icon="send"
                  size={18}
                  iconColor="#FFFFFF"
                  style={{ margin: 0, marginLeft: 2 }}
                />
              </View>
            ) : (
              <View style={styles.micIconBg}>
                <IconButton
                  icon="microphone"
                  size={20}
                  iconColor="#B5BAC1"
                  style={{ margin: 0 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DISCORD_COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: DISCORD_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: DISCORD_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: DISCORD_COLORS.textMuted,
    fontSize: 14,
  },
  // Header
  header: {
    height: 52,
    backgroundColor: DISCORD_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: DISCORD_COLORS.divider,
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
  headerAvatarContainer: {
    marginRight: 10,
    position: 'relative',
  },
  headerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerStatusIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: DISCORD_COLORS.background,
  },
  headerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerNameText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIcon: {
    marginLeft: 0,
  },
  // Messages List
  messagesList: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E1F22",
  },
  dateText: {
    color: DISCORD_COLORS.textDark,
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 12,
  },
  // Message
  messageContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  messageContainerFirst: {
    marginTop: 12,
  },
  messageContainerSequence: {
    marginTop: 0,
  },
  avatarColumn: {
    width: 42,
    marginRight: 14,
    alignItems: "center",
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  sequenceTime: {
    color: DISCORD_COLORS.textDark,
    fontSize: 10,
    marginTop: 10,
    opacity: 0.6,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  senderNameMe: {
    color: "#FFFFFF", // Standard Discord white for names
  },
  timestamp: {
    color: DISCORD_COLORS.textDark,
    fontSize: 11,
    fontWeight: '500',
  },
  messageText: {
    color: "#DCDDDE",
    fontSize: 16,
    lineHeight: 22,
  },
  // Empty
  emptyContainer: {
    flex: 1,
    padding: 16,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DISCORD_COLORS.blurple,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDescription: {
    color: DISCORD_COLORS.textMuted,
    fontSize: 15,
    lineHeight: 20,
  },
  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: DISCORD_COLORS.background,
  },
  externalActionIcons: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 4,
  },
  inputExternalIconPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2B2D31",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  inputExternalIconSmall: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: DISCORD_COLORS.pillInput,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
    minHeight: 40,
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    maxHeight: 120,
  },
  inputInsideIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
    marginBottom: 2,
  },
  inputExternalIconRight: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  sendIconActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DISCORD_COLORS.blurple,
    justifyContent: "center",
    alignItems: "center",
  },
  micIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2B2D31",
    justifyContent: "center",
    alignItems: "center",
  }
});
