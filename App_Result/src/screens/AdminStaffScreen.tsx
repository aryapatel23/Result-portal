import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
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
    isActive: boolean;
    subjects: string[];
}

const AdminStaffScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTeachers = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.ADMIN.TEACHERS_LIST);
            setTeachers(res.data);
            applySearch(searchQuery, res.data);
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

    const applySearch = (query: string, data: Teacher[]) => {
        const filtered = data.filter(t =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.employeeId.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTeachers(filtered);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        applySearch(text, teachers);
    };

    const renderTeacher = ({ item }: { item: Teacher }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('TeacherDetail', { teacherId: item._id })}
        >
            <View style={styles.cardContent}>
                <View style={[styles.avatar, { backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#dbeafe' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>ID: {item.employeeId}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#dcfce7' : '#fee2e2' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive ? theme.colors.success : theme.colors.error }]} />
                    <Text style={[styles.statusText, { color: item.isActive ? theme.colors.success : theme.colors.error }]}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.border} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar 
                barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
                backgroundColor={theme.colors.surface} 
            />

            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Staff Directory</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('CreateTeacher')}
                >
                    <Icon name="person-add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Teacher</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background }]}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor={theme.colors.textTertiary}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Icon name="close-circle" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTeachers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTeacher}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTeachers(); }} colors={[theme.colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="people-outline" size={64} color={theme.colors.disabled} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No staff members found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: { fontSize: 24, fontWeight: '800' },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '600',
    },
    list: { padding: 20, paddingBottom: 100 },
    card: {
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 20, fontWeight: '700' },
    info: { flex: 1, marginLeft: 16 },
    name: { fontSize: 16, fontWeight: '700' },
    meta: { fontSize: 13, marginTop: 2 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
        gap: 6,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
});

export default AdminStaffScreen;
