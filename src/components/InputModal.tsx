import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Portal } from 'react-native-paper';

interface InputModalProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    label?: string;
    description?: string;
    defaultValue?: string;
    placeholder?: string;
    onConfirm: (text: string) => void;
    confirmText?: string;
}

export const InputModal = ({
    visible,
    onDismiss,
    title,
    label = "TÊN",
    description,
    defaultValue = "",
    placeholder = "",
    onConfirm,
    confirmText = "Xác nhận"
}: InputModalProps) => {
    const [text, setText] = useState(defaultValue);

    useEffect(() => {
        if (visible) {
            setText(defaultValue);
        }
    }, [visible, defaultValue]);

    const handleConfirm = () => {
        onConfirm(text);
        setText(''); // Reset after confirm
        onDismiss();
    };

    const handleDismiss = () => {
        setText('');
        onDismiss();
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleDismiss}
            >
                <View className="flex-1 bg-black/70 justify-center items-center px-4">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full"
                    >
                        <View className="bg-[#313338] w-full rounded-[14px] p-6 shadow-2xl">
                            <Text className="text-[#F2F3F5] text-2xl font-bold text-center mb-2">
                                {title}
                            </Text>

                            {description && (
                                <Text className="text-[#B5BAC1] text-center mb-6 text-sm">
                                    {description}
                                </Text>
                            )}

                            <View className="mb-6 mt-4">
                                <Text className="text-[#B5BAC1] text-xs font-bold uppercase mb-2">
                                    {label}
                                </Text>
                                <TextInput
                                    value={text}
                                    onChangeText={setText}
                                    placeholder={placeholder}
                                    placeholderTextColor="#949BA4"
                                    className="bg-[#1E1F22] text-[#F2F3F5] p-3 rounded-[4px] font-medium text-base h-12"
                                    autoFocus
                                    selectionColor="#5865F2"
                                />
                            </View>

                            <View className="flex-row justify-end space-x-4 bg-[#2B2D31] -mx-6 -mb-6 p-4 rounded-b-[14px]">
                                <TouchableOpacity
                                    onPress={handleDismiss}
                                    className="px-6 py-2.5 rounded-[4px]"
                                >
                                    <Text className="text-white font-medium">Hủy bỏ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    className="bg-[#5865F2] px-6 py-2.5 rounded-[4px] active:bg-[#4752C4]"
                                >
                                    <Text className="text-white font-bold">{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </Portal>
    );
};
