import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    FlatList,
    Dimensions,
    StatusBar,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface ResultRecord {
    _id: string;
    studentName: string;
    grNumber: string;
    standard: string;
    dateOfBirth: string;
    subjects: Array<{ name: string; marks: number; maxMarks: number }>;
    uploadedBy: {
        _id: string;
        name: string;
        employeeId: string;
    } | string;
    createdAt: string;
}

interface TeacherGroup {
    teacherId: string;
    teacherName: string;
    employeeId: string;
    results: ResultRecord[];
}

const AdminResultsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [results, setResults] = useState<ResultRecord[]>([]);
    const [filteredResults, setFilteredResults] = useState<ResultRecord[]>([]);
    const [groupedByTeacher, setGroupedByTeacher] = useState<TeacherGroup[]>([]);
    const [expandedTeachers, setExpandedTeachers] = useState<Record<string, boolean>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStandard, setSelectedStandard] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(API_ENDPOINTS.RESULTS.ADMIN);
            setResults(response.data);
            applyFilters(response.data, searchQuery, selectedStandard);
        } catch (error) {
            console.error('Error fetching admin results:', error);
            Alert.alert('Error', 'Failed to load results.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const applyFilters = (data: ResultRecord[], query: string, std: string) => {
        let filtered = data;
        if (query) {
            filtered = filtered.filter(item =>
                item.studentName.toLowerCase().includes(query.toLowerCase()) ||
                item.grNumber.includes(query)
            );
        }
        if (std) {
            filtered = filtered.filter(item => item.standard === std);
        }
        setFilteredResults(filtered);
        groupResults(filtered);
    };

    const groupResults = (data: ResultRecord[]) => {
        const groups: Record<string, TeacherGroup> = {};
        data.forEach(result => {
            let teacherId = 'unknown';
            let teacherName = 'Staff';
            let employeeId = 'N/A';

            if (result.uploadedBy && typeof result.uploadedBy === 'object') {
                teacherId = result.uploadedBy._id;
                teacherName = result.uploadedBy.name;
                employeeId = result.uploadedBy.employeeId;
            } else if (typeof result.uploadedBy === 'string') {
                teacherId = result.uploadedBy;
                teacherName = `ID: ${teacherId.slice(-6)}`;
            }

            if (!groups[teacherId]) {
                groups[teacherId] = { teacherId, teacherName, employeeId, results: [] };
            }
            groups[teacherId].results.push(result);
        });
        setGroupedByTeacher(Object.values(groups).sort((a, b) => a.teacherName.localeCompare(b.teacherName)));
    };

    useEffect(() => {
        applyFilters(results, searchQuery, selectedStandard);
    }, [searchQuery, selectedStandard]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getPerf = (pct: number) => {
        if (pct >= 80) return { label: 'Excellent', color: '#10b981', bg: '#ecfdf5' };
        if (pct >= 60) return { label: 'Good', color: '#3b82f6', bg: '#eff6ff' };
        if (pct >= 40) return { label: 'Average', color: '#f59e0b', bg: '#fffbeb' };
        return { label: 'Low', color: '#ef4444', bg: '#fef2f2' };
    };

    const standards = ['Balvatika', ...Array.from({ length: 12 }, (_, i) => `STD ${i + 1}`)];

    const renderGroup = ({ item }: { item: TeacherGroup }) => {
        const expanded = expandedTeachers[item.teacherId];
        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={[styles.cardHeader, expanded && { backgroundColor: theme.colors.background }]}
                    onPress={() => setExpandedTeachers(prev => ({ ...prev, [item.teacherId]: !expanded }))}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.teacherName.charAt(0)}</Text>
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.name}>{item.teacherName}</Text>
                            <Text style={styles.meta}>{item.employeeId} • {item.results.length} Students</Text>
                        </View>
                    </View>
                    <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} color={'#64748b'} />
                </TouchableOpacity>

                {expanded && (
                    <View style={{ padding: 12, gap: 8 }}>
                        {item.results.map((res) => {
                            const total = res.subjects.reduce((s, sub) => s + sub.marks, 0);
                            const max = res.subjects.reduce((s, sub) => s + sub.maxMarks, 0);
                            const pct = max > 0 ? (total / max) * 100 : 0;
                            const perf = getPerf(pct);

                            return (
                                <TouchableOpacity
                                    key={res._id}
                                    style={styles.resultItem}
                                    onPress={() => navigation.navigate('Results', { result: res })}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.studentName}>{res.studentName}</Text>
                                        <Text style={styles.studentMeta}>GR: {res.grNumber} • {res.standard}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <View style={[styles.badge, { backgroundColor: perf.bg }]}>
                                            <Text style={[styles.badgeText, { color: perf.color }]}>{pct.toFixed(0)}%</Text>
                                        </View>
                                        <Text style={[styles.perfLabel, { color: perf.color }]}>{perf.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnNav}>
                    <Icon name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Academic Insights</Text>
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.btnFilter}>
                    <Icon name="options-outline" size={20} color={showFilters ? theme.colors.primary : theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBlock}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={18} color={theme.colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search student or GR..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {showFilters && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                        <TouchableOpacity
                            style={[styles.stdChip, selectedStandard === '' && styles.stdChipActive]}
                            onPress={() => setSelectedStandard('')}
                        >
                            <Text style={[styles.stdChipText, selectedStandard === '' && { color: theme.colors.surface }]}>All Grades</Text>
                        </TouchableOpacity>
                        {standards.map(std => (
                            <TouchableOpacity
                                key={std}
                                style={[styles.stdChip, selectedStandard === std && styles.stdChipActive]}
                                onPress={() => setSelectedStandard(std)}
                            >
                                <Text style={[styles.stdChipText, selectedStandard === std && { color: theme.colors.surface }]}>{std}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 12, color: theme.colors.textSecondary, fontWeight: '600' }}>Loading Data...</Text>
                </View>
            ) : (
                <FlatList
                    data={groupedByTeacher}
                    keyExtractor={(item) => item.teacherId}
                    renderItem={renderGroup}
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="document-text-outline" size={48} color={theme.colors.border} />
                            <Text style={styles.emptyTitle}>No Results Found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 72,
        backgroundColor: theme.colors.surface,
    },
    btnNav: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    btnFilter: {
        padding: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
    },
    searchBlock: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
    },
    stdChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        marginRight: 8,
    },
    stdChipActive: {
        backgroundColor: theme.colors.primary,
    },
    stdChipText: {
        fontSize: 13,
        fontWeight: '800',
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    meta: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 8,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    studentMeta: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '900',
    },
    perfLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
});

export default AdminResultsScreen;
