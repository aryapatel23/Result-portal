import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    TextInput,
    Modal,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

interface Teacher {
    _id: string;
    name: string;
    employeeId: string;
    email: string;
    subjects: string[];
    isActive?: boolean;
}

const AdminTimetableScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTeachers = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.TEACHERS_LIST);
            const sorted = response.data.sort((a: Teacher, b: Teacher) => {
                if (a.isActive === b.isActive) return 0;
                return a.isActive === false ? 1 : -1;
            });
            setTeachers(sorted);
            setFilteredTeachers(sorted);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        let result = [];
        if (searchQuery.trim() === '') {
            result = [...teachers];
        } else {
            const query = searchQuery.toLowerCase();
            result = teachers.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.employeeId.toLowerCase().includes(query)
            );
        }
        // Always sort by status
        result.sort((a, b) => {
            if (a.isActive === b.isActive) return 0;
            return a.isActive === false ? 1 : -1;
        });
        setFilteredTeachers(result);
    }, [searchQuery, teachers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTeachers();
    };

    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);

    const handleTeacherPress = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setActionModalVisible(true);
    };

    const renderTeacher = ({ item }: { item: Teacher }) => (
        <TouchableOpacity
            style={styles.teacherCard}
            onPress={() => handleTeacherPress(item)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? '#10b981' : '#ef4444' }]} />
                </View>
                <Text style={styles.subtext}>{item.employeeId} • {item.subjects?.join(', ') || 'General'}</Text>
            </View>
            <Icon name="ellipsis-vertical" size={20} color={'#64748b'} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={'#0f172a'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Directory</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={20} color={'#64748b'} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search teacher or ID..."
                        placeholderTextColor={'#64748b'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color={'#64748b'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={'#f59e0b'} />
                </View>
            ) : (
                <FlatList
                    data={filteredTeachers}
                    renderItem={renderTeacher}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="people-outline" size={48} color={'#e2e8f0'} />
                            <Text style={styles.emptyText}>No teachers found</Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={actionModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setActionModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setActionModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalAvatar}>
                                <Text style={styles.modalAvatarText}>{selectedTeacher?.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.modalHeaderText}>
                                <Text style={styles.modalTeacherName}>{selectedTeacher?.name}</Text>
                                <Text style={styles.modalTeacherId}>{selectedTeacher?.employeeId}</Text>
                            </View>
                        </View>

                        <View style={styles.actionList}>
                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => {
                                    setActionModalVisible(false);
                                    navigation.navigate('AdminManageTimetable', {
                                        teacherId: selectedTeacher?._id,
                                        teacherName: selectedTeacher?.name
                                    });
                                }}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                                    <Icon name="calendar" size={22} color={'#f59e0b'} />
                                </View>
                                <Text style={styles.actionText}>Manage Timetable</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => {
                                    setActionModalVisible(false);
                                    navigation.navigate('TeacherDetail', {
                                        teacherId: selectedTeacher?._id
                                    });
                                }}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                                    <Icon name="person" size={22} color="#3b82f6" />
                                </View>
                                <Text style={styles.actionText}>View Profile</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setActionModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    searchContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '600',
    },
    list: {
        padding: 20,
    },
    teacherCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#fffbeb', // Light amber
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 4,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    subtext: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    modalAvatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#fffbeb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAvatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    modalHeaderText: {
        marginLeft: 16,
    },
    modalTeacherName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    modalTeacherId: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    actionList: {
        gap: 12,
        marginBottom: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginLeft: 16,
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textSecondary,
    },
});

export default AdminTimetableScreen;
