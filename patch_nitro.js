const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ChatArea.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Dimensions to imports
if (!content.includes('Dimensions')) {
    content = content.replace('TouchableOpacity, View', 'TouchableOpacity, View, Dimensions, ScrollView');
}

// 2. Add State
if (!content.includes('giftModalVisible')) {
    content = content.replace(
        'const [error, setError] = useState<string | null>(null);',
        'const [error, setError] = useState<string | null>(null);\n    const [giftModalVisible, setGiftModalVisible] = useState(false);\n    const [activeNitroCard, setActiveNitroCard] = useState(0);'
    );
}

// 3. Update Gift Button
const giftMatch = '<IconButton icon="gift" size={24} iconColor="#B5BAC1" style={{ margin: 0 }} />';
if (content.includes(giftMatch)) {
    content = content.replace(
        '<TouchableOpacity style={styles.inputExternalIcon}>',
        '<TouchableOpacity style={styles.inputExternalIcon} onPress={() => setGiftModalVisible(true)} activeOpacity={0.8}>'
    );
}

// 4. Create Modal Component JSX
const modalJSX = `
            {/* Nitro Gift Modal */}
            <Modal visible={giftModalVisible} animationType="fade" transparent={true} onRequestClose={() => setGiftModalVisible(false)}>
                <View style={styles.giftModalOverlay}>
                    {/* Header */}
                    <View style={styles.giftModalHeader}>
                        <TouchableOpacity onPress={() => setGiftModalVisible(false)} style={styles.giftCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <IconButton icon="close" size={24} iconColor="#FFFFFF" style={{ margin: 0 }} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.giftModalTitle}>Tặng gói thành viên Nitro mới</Text>
                    <Text style={styles.giftModalSubtitle}>Cảnh báo: quà tặng có thể gây ra niềm vui không thể kiểm soát!</Text>

                    {/* Cards Carousel */}
                    <View style={styles.giftCarouselContainer}>
                        <ScrollView 
                            horizontal 
                            pagingEnabled 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
                            onScroll={(e) => {
                                const offset = e.nativeEvent.contentOffset.x;
                                const index = Math.round(offset / (Dimensions.get('window').width - 40));
                                if (index !== activeNitroCard) setActiveNitroCard(index);
                            }}
                            scrollEventThrottle={16}
                            snapToInterval={Dimensions.get('window').width - 24}
                            decelerationRate="fast"
                        >
                            {/* Card 1: Nitro Basic */}
                            <View style={[styles.nitroCard, { backgroundColor: '#00A8FC' }]}>
                                <View style={styles.nitroCardTop}>
                                    <View>
                                        <Text style={styles.nitroCardHeaderBasic}>NITRO BASIC</Text>
                                        <Text style={styles.nitroPriceText}>Chọn từ 79.000 đ/{"\\n"}tháng hoặc{"\\n"}779.000 đ/năm</Text>
                                    </View>
                                    <View style={styles.nitroMascotPlaceholder}>
                                        <IconButton icon="bicycle" size={40} iconColor="#FFFFFF" style={{ margin: 0 }} />
                                    </View>
                                </View>

                                <Text style={styles.nitroTargetText}>Người nhận của bạn sẽ được:</Text>
                                
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="upload" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Tải lên 50MB</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="emoticon-happy" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Emoji tùy chọn tại bất cứ đâu</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="fan" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Huy hiệu Nitro đặc biệt trên trang cá nhân của bạn</Text>
                                </View>

                                <View style={{ flex: 1 }} />
                                <TouchableOpacity style={styles.nitroActionBtn} activeOpacity={0.8}>
                                    <Text style={[styles.nitroActionBtnText, { color: '#00A8FC' }]}>Tặng Gói Nitro Cơ Bản</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Card 2: Nitro Standard */}
                            <View style={[styles.nitroCard, { backgroundColor: '#B538C4' }]}>
                                <View style={styles.nitroCardTop}>
                                    <View>
                                        <Text style={styles.nitroCardHeader}>NITRO</Text>
                                        <Text style={styles.nitroPriceText}>Chọn từ 231.000 đ/{"\\n"}tháng hoặc{"\\n"}2.300.000 đ/năm</Text>
                                    </View>
                                    <View style={styles.nitroMascotPlaceholder}>
                                        <IconButton icon="rocket-launch" size={40} iconColor="#FFFFFF" style={{ margin: 0 }} />
                                    </View>
                                </View>

                                <Text style={styles.nitroTargetText}>Người nhận của bạn sẽ được:</Text>
                                
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="upload" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Tải lên 500MB</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="emoticon-happy" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Emoji tùy chọn tại bất cứ đâu</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="star" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Biểu Cảm Siêu Cấp Không Giới Hạn</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="monitor" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Đang stream video HD</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="server" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>2 Nâng Cấp Máy Chủ</Text>
                                </View>
                                <View style={styles.nitroFeatureRow}>
                                    <IconButton icon="account-box" size={20} iconColor="#FFFFFF" style={styles.nitroFeatureIcon} />
                                    <Text style={styles.nitroFeatureText}>Hồ sơ tùy chỉnh và hơn thế nữa!</Text>
                                </View>

                                <View style={{ flex: 1 }} />
                                <TouchableOpacity style={styles.nitroActionBtn} activeOpacity={0.8}>
                                    <Text style={[styles.nitroActionBtnText, { color: '#B538C4' }]}>Tặng Nitro</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>

                    {/* Pagination Indicators */}
                    <View style={styles.giftPagination}>
                        <View style={[styles.paginationDot, activeNitroCard === 0 && styles.paginationDotActive]} />
                        <View style={[styles.paginationDot, activeNitroCard === 1 && styles.paginationDotActive]} />
                    </View>
                </View>
            </Modal>
`;

if (!content.includes('Tặng gói thành viên Nitro mới')) {
    content = content.replace('        </View >\n    );\n};', modalJSX + '\n        </View>\n    );\n};');
}

// 5. Add Styles
const stylesJSX = `
    // Nitro Gift Modal
    giftModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
    },
    giftModalHeader: {
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 16,
        alignItems: 'flex-start',
    },
    giftCloseBtn: {
        marginBottom: 10,
    },
    giftModalTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    giftModalSubtitle: {
        color: '#B5BAC1',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    giftCarouselContainer: {
        height: 520,
        width: '100%',
    },
    nitroCard: {
        width: Dimensions.get('window').width - 40,
        height: '100%',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 8,
    },
    nitroCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    nitroCardHeaderBasic: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    nitroCardHeader: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    nitroPriceText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    nitroMascotPlaceholder: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    nitroTargetText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 16,
    },
    nitroFeatureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    nitroFeatureIcon: {
        margin: 0,
        marginRight: 12,
        marginTop: -6,
    },
    nitroFeatureText: {
        color: '#FFFFFF',
        fontSize: 15,
        flex: 1,
        lineHeight: 20,
    },
    nitroActionBtn: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nitroActionBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    giftPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3F4147',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#5865F2',
        width: 16,
    }
});`;

if (!content.includes('giftModalOverlay')) {
    content = content.replace('});', stylesJSX);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Success');
