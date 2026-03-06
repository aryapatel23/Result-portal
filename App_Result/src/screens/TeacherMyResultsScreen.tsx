/**
 * Teacher My Results Screen
 * 
 * Personalized result management for teachers.
 * Displays only results uploaded by the authenticated teacher.
 */

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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Subject {
    subject: string;
    obtainedMarks: number;
    totalMarks: number;
    _id?: string;
}

interface ResultRecord {
    _id: string;
    studentName: string;
    grNumber: string;
    standard: string;
    subjects: Subject[];
    academicYear: string;
    term: string;
    uploadedBy: string | any;
    createdAt: string;
}

const TeacherMyResultsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [results, setResults] = useState<ResultRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMyResults = async () => {
        try {
            // We use the same admin endpoint but filter on client side or backend if supported.
            // Based on earlier analysis, getAllResultsForAdmin filters by standard if provided.
            // For now, we'll fetch all and filter by the teacher's ID.
            const response = await apiClient.get(API_ENDPOINTS.RESULTS.ADMIN);
            const allResults: ResultRecord[] = response.data;

            // Filter results uploaded by the current teacher
            const myResults = allResults.filter(r => {
                const uploadedById = typeof r.uploadedBy === 'object' ? r.uploadedBy._id : r.uploadedBy;
                const currentUserId = (user as any)?._id || (user as any)?.id;
                return uploadedById === currentUserId;
            });

            setResults(myResults);
        } catch (error) {
            console.error('Error fetching teacher results:', error);
            Alert.alert('Error', 'Failed to load your results.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyResults();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyResults();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Result',
            'Are you sure you want to delete this result? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`${API_ENDPOINTS.RESULTS.BASE}/${id}`);
                            setResults(prev => prev.filter(r => r._id !== id));
                            Alert.alert('Success', 'Result deleted successfully.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete result.');
                        }
                    }
                }
            ]
        );
    };

    const filteredResults = results.filter(r =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.grNumber.includes(searchQuery)
    );

    const renderResult = ({ item }: { item: ResultRecord }) => {
        const totalObtained = item.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
        const totalMarks = item.subjects.reduce((sum, s) => sum + s.totalMarks, 0);
        const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

        return (
            <View style={styles.resultCard}>
                <View style={styles.cardInfo}>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <Text style={styles.studentMeta}>GR: {item.grNumber} • {item.standard}</Text>
                    <View style={styles.tagRow}>
                        <View style={styles.termTag}>
                            <Text style={styles.tagText}>{item.term}</Text>
                        </View>
                        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreText}>{percentage.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.btnRow}>
                        <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => navigation.navigate('AdminUploadResult', { resultId: item._id })}
                        >
                            <Icon name="create-outline" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => handleDelete(item._id)}
                        >
                            <Icon name="trash-outline" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Uploaded Results</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={20} color={theme.colors.placeholder} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search student or GR..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredResults}
                    keyExtractor={(item) => item._id}
                    renderItem={renderResult}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="document-text-outline" size={64} color={theme.colors.disabled} />
                            <Text style={styles.emptyText}>No results found</Text>
                            <TouchableOpacity
                                style={styles.uploadBtn}
                                onPress={() => navigation.navigate('AdminUploadResult' as never)}
                            >
                                <Text style={styles.uploadBtnText}>Upload New Result</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    searchContainer: {
        padding: 20,
        backgroundColor: '#fff',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#111827',
    },
    list: {
        padding: 20,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    studentMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    termTag: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    dateText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    cardActions: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#F3F4F6',
    },
    scoreCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        marginTop: 16,
    },
    uploadBtn: {
        marginTop: 24,
        backgroundColor: '#4f46e5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    uploadBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TeacherMyResultsScreen;
